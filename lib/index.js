import { Control as controlComponent }  from './SelectControl.jsx'
import schema from './schema'

const preview = null

const Widget = {
    name: 'select-async',
    controlComponent,
    preview,
    schema
}

// if (typeof window !== 'undefined') {
//     window.WIDGET_CONTROL = controlComponent
//     console.log('con')
// }
// export const NetlifyCmsWidgetSelect = { Widget, Control }
export {
    Widget,
    controlComponent,
    schema
}
