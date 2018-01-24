import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import ClockIcon from 'react-icons/lib/fa/clock-o'
import { TrapApiError, Widget, WidgetHeader, WidgetBody, WidgetStatusBadge } from '@mozaik/ui'

export default class Incidents extends Component {
    static propTypes = {
        pageId: PropTypes.string.isRequired,
        apiError: PropTypes.object,
        apiData: PropTypes.object
    }

    static getApiRequest({ pageId }) {
        return {
            id: 'statuspage-io.incident',
            params: { pageId },
        }
    }

    render() {
        const { apiData: incident, apiError } = this.props

        let status = 'unknown' 
        let messageNode
        let meta
        if (incident) {
            console.log(incident)
            if (incident.resolved_at) {
                status = 'success'
                messageNode = 'Everything operating normally.'
            } else {
                status = 'warning'
                messageNode = `${incident.name}: ${incident.status}`
            }
            meta = (
                <span>
                    <ClockIcon style={{ display: 'inline-block' }}/>&nbsp;
                    {moment(incident.resolved_at || incident.updated_at || incident.created_at).fromNow()}
                </span>
            )
        }

        return (
            <Widget>
                <WidgetHeader
                    title={incident ? incident.page.name : 'Unknown'}
                    subject="Status"
                    subjectPlacement="append"
                />
                <WidgetBody>
                    <TrapApiError error={apiError}>
                        <WidgetStatusBadge status={status} message={messageNode} meta={meta} />
                    </TrapApiError>
                </WidgetBody>
            </Widget>
        )
    }
}