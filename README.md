# salesforce-webviewer-diff

## Deployment

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

Once you have deployed the repository to your target org, navigate to your desired Lightning Page and use the gear wheel, then select `Edit Page`. Under `Custom`, drag and drop the `pdftronWebViewerDiffContainer` onto your desired Lightning Page, click `Save` and make sure the page is activated under `Activation`.

Use the search bar to look for files (keep in mind you can only search files that you have access to). When you have selected two files, you can click `Compare` and the files will load up side by side in WebViewer with highlighted diffs like so:

<img width="1792" alt="Screen Shot 2021-09-27 at 1 39 36 PM" src="https://user-images.githubusercontent.com/17137847/134959651-e7548243-4ebd-4cae-9c8a-16ef2dce0337.png">
