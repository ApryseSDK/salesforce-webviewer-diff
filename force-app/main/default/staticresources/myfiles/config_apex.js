//for WebViewer v8.x.x +

var urlSearch = new URLSearchParams(location.hash)
var custom = JSON.parse(urlSearch.get('custom'))

var resourceURL = '/resource/'
var myfilesUrl = custom.myfilesUrl + '/'
window.Core.forceBackendType('ems')

resourceURL = resourceURL + custom.namespacePrefix

/**
 * The following `window.Core.set*` functions point WebViewer to the
 * optimized source code specific for the Salesforce platform, to ensure the
 * uploaded files stay under the 5mb limit
 */
// office workers
window.Core.setOfficeWorkerPath(resourceURL + 'office')
window.Core.setOfficeAsmPath(resourceURL + 'office_asm')
window.Core.setOfficeResourcePath(resourceURL + 'office_resource')

// pdf workers
window.Core.setPDFResourcePath(resourceURL + 'resource')
if (custom.fullAPI) {
  window.Core.setPDFWorkerPath(resourceURL + 'pdf_full')
  window.Core.setPDFAsmPath(resourceURL + 'asm_full')
} else {
  window.Core.setPDFWorkerPath(resourceURL + 'pdf_lean')
  window.Core.setPDFAsmPath(resourceURL + 'asm_lean')
}

// external 3rd party libraries
window.Core.setExternalPath(resourceURL + 'external')

window.addEventListener('message', receiveMessage, false)
window.addEventListener('documentLoaded', async () => {
  //when document loads, set the layout to side by side continuous display
  instance.UI.setLayoutMode(instance.UI.LayoutMode.FacingContinuous)
})

function _base64ToArrayBuffer (base64) {
  //converts base64 string to ArrayBuffer
  var binary_string = window.atob(base64)
  var len = binary_string.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}

async function receiveMessage (event) {
  if (event.isTrusted && typeof event.data === 'object') {
    switch (event.data.type) {
      case 'DIFF_FILES':
        const { base64strings } = event.data

        const { docViewer, PDFNet } = instance.Core

        //PDFNet needs to be initialized before usage
        await PDFNet.initialize()

        //create new empty document
        const newDoc = await PDFNet.PDFDoc.create()
        await newDoc.lock()

        //create two source documents
        const doc1 = await PDFNet.PDFDoc.createFromBuffer(_base64ToArrayBuffer(base64strings[0]));
        const doc2 = await PDFNet.PDFDoc.createFromBuffer(_base64ToArrayBuffer(base64strings[1]));

        //append two documents and apply diffing algorithm
        await newDoc.appendTextDiffDoc(doc1, doc2)

        await newDoc.unlock()

        //load new document
        instance.loadDocument(newDoc, {
          extension: 'pdf'
        })

        break
      case 'CLOSE_DOCUMENT':
        instance.closeDocument()
        break
      default:
        break
    }
  }
}
