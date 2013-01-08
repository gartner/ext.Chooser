/**
 * Created with JetBrains PhpStorm.
 * User: Mads
 * Date: 08-01-13
 * Time: 09:24
 * To change this template use File | Settings | File Templates.
 */
function FileBrowserHook (field_name, url, type, win) {

    var cmsURL = '/jscripts/ext.Chooser/tinyMCE-fileBrowser.html';

    // This config will be passed on to the ext.Chooser
    var config = {
        // The following will be overridden in the tinyMCE-fileBrowser.html
        //type: type,
        //window: {
        //    resizable: false,
        //    draggable: false,
        //    width: 600,
        //    height: 500,
        //    closable: false
        //}

        // ..but these should be set to something that provides the needed json-data
        dataUrl: '/fotos/list/',
        treeUrl: '/fotos/taglist/'
    };

    /**
     * If you work with sessions in PHP and your client doesn't accept cookies you might need to carry
     * the session name and session ID in the request string (can look like this: "?PHPSESSID=88p0n70s9dsknra96qhuk6etm5").
     * These lines of code extract the necessary parameters and add them back to the filebrowser URL again.
     */

    //add the type as the only query parameter
    if (cmsURL.indexOf("?") < 0) {
        cmsURL = cmsURL + "?type=" + type;
    } else {
        // Preserve existing query-params
        // (PHP session ID is now included if there is one at all)
        cmsURL = cmsURL + "&type=" + type;
    }

    tinyMCE.activeEditor.windowManager.open({
        file : cmsURL,
        title : 'File Browser',
        width : 600,  // Your dimensions may differ - toy around with them!
        height : 500,
        resizable : true,
        inline : true,  // This parameter only has an effect if you use the inlinepopups plugin!
        close_previous : false
    }, {
        window : win,
        input : field_name,
        type: type,
        config: config
    });

    return false;
}
