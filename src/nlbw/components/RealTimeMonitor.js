import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SitemapIcon from 'react-icons/lib/fa/sitemap'
import { ResponsiveLine } from '@nivo/line'
import { withTheme } from 'styled-components'
import {
    TrapApiError,
    Widget,
    WidgetHeader,
    WidgetBody,
    WidgetLoader
} from '@mozaik/ui'

class RealTimeMonitor extends Component {
    static propTypes = {
        title: PropTypes.string,
        value: PropTypes.oneOf(['rx_bytes', 'conns', 'tx_bytes', 'tx_pkts']).isRequired,
        apiError: PropTypes.object,
        apiData: PropTypes.shape({
          data: PropTypes.arrayOf(PropTypes.shape({
            family: PropTypes.number,
            proto: PropTypes.string,
            port: PropTypes.number,
            mac: PropTypes.string,
            ip: PropTypes.string,
            conns: PropTypes.number,
            rx_bytes: PropTypes.number,
            rx_pkts: PropTypes.number,
            tx_bytes: PropTypes.number,
            tx_pkts: PropTypes.number,
            layer7: PropTypes.string
          })),
          leases: PropTypes.object
        }),
        theme: PropTypes.object.isRequired,
    }

    static getApiRequest() {
        return {
            id: 'nlbw.data'
        }
    }

    render() {
        const { title, apiData: nlbwInfo, apiError, theme, value } = this.props

        let body = <WidgetLoader />
        if (nlbwInfo) {
          let gData = {};

          let last;
          for (const data of nlbwInfo.datas) {
            const traffic = {};
            for (const record of data) {
              if (!(record.mac in traffic)) traffic[record.mac] = 0
              traffic[record.mac] += record[value];
            }
            if (last) {
              for (const mac in traffic) {
                if(!(mac in gData)) gData[mac] = []
                gData[mac].push((traffic[mac] - last[mac]) / 10)
              }
            }
            last = traffic;
          }

          /*const values = Object.values(gData)
          gData.Total = [];

          for (const bytes of values)
            gData.Total = bytes.map((b,i) => b + (gData.Total[i] || 0))
          */
          console.log(gData);

          body = (
            <ResponsiveLine
              data={
                Object.entries(gData)
                  .filter(([,value]) => value.some(e => e > 1e3))
                  .map(([mac, value]) => ({
                    id: mac in nlbwInfo.leases ? nlbwInfo.leases[mac].name : mac,
                    data: value.map((d, i) => ({
                      y: d / 1e3,
                      x: -(value.length - i - 1) * 10,
                    }))
                  }))
              }
              //curve="monotoneX"
              isInteractive={false}
              enableDots={false}
              theme={theme.charts}
              colors="paired"
              margin={{
                top: 25,
                right: 25,
                bottom: 75,
                left: 55
              }}
              legends={[
                {
                    anchor: "bottom",
                    direction: "row",
                    translateY: 60,
                    itemWidth: 150,
                    itemHeight: 12,
                    symbolSize: 12,
                    symbolShape: "circle",
                }
            ]}
            axisBottom={{
              "orient": "bottom",
              "tickSize": 5,
              "tickPadding": 10,
              "tickRotation": 0,
              "legend": "s",
              "legendOffset": 30,
              "legendPosition": "center"
            }}
            axisLeft={{
                "orient": "left",
                "tickSize": 5,
                "tickPadding": 5,
                "tickRotation": 0,
                "legend": "kByte/s",
                "legendOffset": -40,
                "legendPosition": "center"
            }}
            />
          )
        }

        return (
            <Widget>
                <WidgetHeader
                    title={title || ''}
                    subject={title ? null : `Traffic Monitor by ${value}`}
                    icon={SitemapIcon}
                />
                <WidgetBody>
                    <TrapApiError error={apiError}>
                        {body}
                    </TrapApiError>
                </WidgetBody>
            </Widget>
        )
    }
}

export default withTheme(RealTimeMonitor)