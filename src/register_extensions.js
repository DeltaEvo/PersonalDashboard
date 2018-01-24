import { Registry } from '@mozaik/ui'

import github from '@mozaik/ext-github'
import time from '@mozaik/ext-time'
import nlbw from './nlbw/components'
import statuspageIo from './statuspage-io/components'

Registry.addExtensions({
    github,
    time,
    nlbw,
    'statuspage-io': statuspageIo
})
