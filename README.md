>Warning This repository is now archived and will not be updated

>This repository was originally published to foster collaboration and engagement with developers as they customized or developed visualizations, but due to customer feedback and usage data, it is now moved back to closed source. Moving this and other projects back to closed source will support better integration with internal build and test tooling, and free up resources for investment in these and other visualizations.

# Trellis container
This extension is part of the extension bundles for Qlik Sense. The repository is maintained and moderated by Qlik RD.

Feel free to fork and suggest pull requests for improvements and bug fixes. Changes will be moderated and reviewed before inclusion in future bundle versions. Please note that emphasis is on backward compatibility, i.e. breaking changes will most likely not be approved.

Usage documentation for the extension is available at https://help.qlik.com.

# Developing the extension
If you want to do code changes to the extension follow these simple steps to get going.

1. Get Qlik Sense Desktop
1. Create a new app and add Trellis container to a sheet.
2. Clone the repository
3. Run `npm install`
4. Run `npm run build` - to build a dev-version to the /dist folder.
5. Move the content of the /dist folder to the extension directory. Usually in `C:/Users/<user>/Documents/Qlik/Sense/Extensions/qlik-trellis-container`.

# Resources Used in this Extension
[Qwik Trellis by Riley MacDonald](https://github.com/rileymd88/qwik-trellis)

# Original authors
[github.com/rileymd88](https://github.com/rileymd88)

# License
Released under the [MIT License](LICENSE).
