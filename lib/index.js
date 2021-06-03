import { Control as controlComponent }  from './SelectControl.jsx'
import previewComponent from './SelectPreview.jsx'

import schema from './schema'


const Widget = {
    name: 'select-async',
    controlComponent,
    previewComponent,
    schema
}

export {
    Widget,
    controlComponent,
    previewComponent,
    schema
}
