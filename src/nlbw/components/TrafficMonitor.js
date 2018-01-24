import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SitemapIcon from 'react-icons/lib/fa/sitemap'
import { ResponsivePie } from 'nivo'
import prettyBytes from 'pretty-bytes';
import { withTheme } from 'styled-components'
import {
    TrapApiError,
    Widget,
    WidgetHeader,
    WidgetBody,
    WidgetLoader
} from '@mozaik/ui'

class TrafficMonitor extends Component {
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
            id: 'nlbw.last'
        }
    }

    render() {
        const { title, apiData: nlbwInfo, apiError, theme, value } = this.props

        let body = <WidgetLoader />
        if (nlbwInfo) {
          const traffic = {};

          for (const record of nlbwInfo.data) {
            if (!(record.mac in traffic)) traffic[record.mac] = 0
            traffic[record.mac] += record[value];
          }

          body = (
            <ResponsivePie
              data={
                Object.entries(traffic).map(([mac, value]) => ({
                  id: mac,
                  label: mac,
                  value
                }))
              }
              sliceLabel={d => prettyBytes(d.value)}
              slicesLabelsSkipAngle={10}
              slicesLabelsTextColor={theme.colors.background}
              radialLabel={d => d.label in nlbwInfo.leases ? nlbwInfo.leases[d.label].name : d.label }
              radialLabelsSkipAngle={10}
              isInteractive={false}
              theme={theme.charts}
              colors={theme.charts.colors}
              margin={{
                top: 25,
                right: 25,
                bottom: 25,
                left: 25
              }}
              innerRadius={0.75}
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

export default withTheme(TrafficMonitor)