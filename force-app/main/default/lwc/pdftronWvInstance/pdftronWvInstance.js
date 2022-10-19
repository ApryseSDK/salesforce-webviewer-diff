import { LightningElement, wire, track, api } from 'lwc'
import { CurrentPageReference } from 'lightning/navigation'
import { loadScript } from 'lightning/platformResourceLoader'
import libUrl from '@salesforce/resourceUrl/V890_lib'
import myfilesUrl from '@salesforce/resourceUrl/myfiles'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { registerListener, unregisterAllListeners } from 'c/pubsub'

export default class PdftronWvInstance extends LightningElement {
  config = '/config_apex.js'
  error

  fullAPI = true
  @api recordId

  @wire(CurrentPageReference)
  pageRef

  connectedCallback () {
    registerListener('filesSelected', this.handleFilesSelected, this)
    registerListener('closeDocument', this.closeDocument, this)
  }

  disconnectedCallback () {
    unregisterAllListeners(this)
  }

  handleFilesSelected (files) {
    let base64strings = []

    files.forEach(file => {
      base64strings.push(file.body)
    })

    this.iframeWindow.postMessage({ type: 'DIFF_FILES', base64strings }, '*')
  }

  renderedCallback () {
    var self = this
    if (this.uiInitialized) {
      return
    }
    this.uiInitialized = true

    Promise.all([loadScript(self, libUrl + '/webviewer.min.js')])
      .then(() => this.initUI())
      .catch(console.error)
  }

  initUI () {
    var myObj = {
      libUrl: libUrl,
      myfilesUrl: myfilesUrl,
      fullAPI: this.fullAPI || false,
      namespacePrefix: ''
    }

    const viewerElement = this.template.querySelector('div')
    // eslint-disable-next-line no-unused-vars
    const viewer = new WebViewer(
      {
        path: libUrl, // path to the PDFTron 'lib' folder on your server
        custom: JSON.stringify(myObj),
        backendType: 'ems',
        config: myfilesUrl + this.config, //path to config file stored in /staticresources/
        fullAPI: this.fullAPI,
        enableOptimizedWorkers: false
        // l: 'YOUR_LICENSE_KEY_HERE',
      },
      viewerElement
    )

    viewerElement.addEventListener('ready', () => {
      this.iframeWindow = viewerElement.querySelector('iframe').contentWindow
    })
  }

  @api
  closeDocument () {
    this.iframeWindow.postMessage({ type: 'CLOSE_DOCUMENT' }, '*')
  }
}
