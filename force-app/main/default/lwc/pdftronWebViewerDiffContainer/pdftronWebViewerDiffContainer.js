import { LightningElement, wire } from 'lwc'
import { CurrentPageReference } from 'lightning/navigation'
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub'
import apexSearch from '@salesforce/apex/PDFTron_ContentVersionController.search'
import getFileDataFromId from '@salesforce/apex/PDFTron_ContentVersionController.getFileDataFromId'

export default class PdftronWebViewerDiffContainer extends LightningElement {
  @wire(CurrentPageReference) pageRef

  errors = []
  isLoading = false

  files = []

  handleSearch (event) {
    const lookupElement = event.target
    apexSearch(event.detail)
      .then(results => {
        lookupElement.setSearchResults(results)
      })
      .catch(error => {
        // TODO: handle error
        this.error = error
        console.error(error)
        let def_message =
          'We have encountered an error while searching for your file  ' +
          event.detail +
          '\n'

        this.showNotification(
          'Error',
          def_message + error.body.message,
          'error'
        )
      })
  }

  handleSingleSelectionChange (event) {
    if (event.detail.length === 0) {
      this.handleClose()
      return
    }

    if (event.detail.length === 1) {
      // 1 out of 2 files selected
      if (!this.files[0]) {
        this.getFile(event.detail[0]) //get 1st file
      }
      return
    } else if (event.detail.length === 2) {
      if (!this.files[1]) {
        this.getFile(event.detail[1]) //get 2nd file
      }
    }
  }

  getFile (recId) {
    this.isLoading = true

    getFileDataFromId({ Id: recId })
      .then(result => {
        this.files.push(result)
        this.isLoading = false
      })
      .catch(error => {
        // TODO: handle error
        this.error = error
        console.error(error)
        this.isLoading = false
        let def_message =
          'We have encountered an error while handling your file. '

        this.showNotification(
          'Error',
          def_message + error.body.message,
          'error'
        )
      })
  }

  handleCompare () {
    this.checkForErrors()
    if (this.errors.length > 0) {
      return
    }
    if (this.files.length === 2) {
      fireEvent(this.pageRef, 'filesSelected', this.files)
    }
  }

  handleClose () {
    fireEvent(this.pageRef, 'closeDocument', '*')
  }

  //check for errors on selection
  checkForErrors () {
    this.errors = []
    const selection = this.template.querySelector('c-lookup').getSelection()

    // No selection made
    if (selection.length === 0) {
      this.errors.push({ message: 'Please make a selection.' })
      return
    }

    // For diffing, we need 2 files
    if (selection.length < 2) {
      this.errors.push({
        message: `You must select 2 PDF files.`
      })
    }
  }
}
