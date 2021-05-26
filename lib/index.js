import { Control as controlComponent }  from './SelectControl.jsx'
// import schema from './schema'

const Widget = {
    name: 'select-ext',
    controlComponent,
}

if (typeof window !== 'undefined') {
    window.WIDGET_CONTROL = controlComponent
    console.log('con')
}
// export const NetlifyCmsWidgetSelect = { Widget, Control }
export {
    Widget,
    controlComponent
}
