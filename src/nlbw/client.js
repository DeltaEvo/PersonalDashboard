const SSH = require('node-ssh');

function transformData(rawData) {
  const { data, columns } = rawData;
  return data.map(e => Object.keys(e).reduce((result, k) => (result[columns[k]] = e[k],result), {}))
}

function parseLeases(leases) {
  return leases.split('\n').reduce((l, data) => {
    const [,mac,ip,name] = data.split(' ');
    l[mac] = {
      ip,
      name
    }
    return l;
  }, {});
}

const client = mozaik => {
  const ssh = new SSH();

  const conn = ssh.connect({
    host: 'router.lan',
    port: 22,
    username: 'root',
    password: 'root'
  });

  const datas = []
  let leases = {}

  conn.then(_ => {
    const fillData = _ => {
      ssh.exec('nlbw', ['-c', 'json'])
          .then(data => {
            datas.push(transformData(JSON.parse(data)))
            if (datas.length > 30) datas.shift();
          })
    }
    setInterval(fillData, 10000)
    fillData()

    const setLeases = _ => {
      ssh.exec('cat', ['/tmp/dhcp.leases'])
          .then(data => leases = parseLeases(data))
    }
    setInterval(setLeases, 300000)
    setLeases()
  })

  return {
    last() {
      return Promise.resolve({
        data: datas[datas.length - 1] || [],
        leases
      })
    },
    data() {
      return {
        datas,
        leases
      }
    }
  }
}

module.exports = client;