/**
 * Created with JetBrains PhpStorm.
 * User: Mads
 * Date: 08-01-13
 * Time: 09:24
 * To change this template use File | Settings | File Templates.
 */
function FileBrowserHook(callback, value, meta)
{
    var cmsURL = "/js/ext.Chooser/tinymce4-filebrowser.html",
        config = {}
        ;

    // This config will be passed on to the ext.Chooser
    switch (meta.filetype) {
        case "file":
            config.dataUrl = "/ajax/files";
            config.treeUrl = "/ajax/doctypes";
            break;
        case "media":
            alert("Cannot use filebrowser for media yet");
            exit;
            break;
        case "image":
        default:
            config.dataUrl = "/ajax/images";
            config.treeUrl = "/ajax/imagetags";
    }

    /**
     * If you work with sessions in PHP and your client doesnt accept cookies you might need to carry
     * the session name and session ID in the request string
     * (can look like this: "?PHPSESSID=88p0n70s9dsknra96qhuk6etm5").
     * These lines of code extract the necessary parameters and add them back to the filebrowser URL again.
     */

    //add the type as the only query parameter
    if (cmsURL.indexOf("?") < 0) {
        cmsURL = cmsURL + "?type=" + meta.filetype;
    } else {
        // Preserve existing query-params
        // (PHP session ID is now included if there is one at all)
        cmsURL = cmsURL + "&type=" + meta.filetype;
    }

    config.window = {
        width: 800,
        height: 400
    };

    function getImageSize(url, callback, meta) {
        var img = document.createElement("img");

        function done(width, height) {
            if (img.parentNode) {
                img.parentNode.removeChild(img);
            }
            meta.width = width;
            meta.height = height;

            callback(url, meta);
        }

        img.onload = function() {
            done(img.clientWidth, img.clientHeight);
        };

        img.onerror = function() {
            done();
        };

        var style = img.style;
        style.visibility = "hidden";
        style.position = "fixed";
        style.bottom = style.left = 0;
        style.width = style.height = "auto";

        document.body.appendChild(img);
        img.src = url;
    }

    tinymce.activeEditor.windowManager.open({
        title: "Select file",
        width: config.window.width + 3,
        height: config.window.height + 3,
        url: cmsURL
}, {
        config: config,
        meta: meta,
        extjsJsPath: '/cms.application/extjs4/ext-all.js',
        extjsCssPath: '/cms.application/extjs4/resources/css/ext-all.css',
        onInsert: function (url, objVals, type) {
            if ("image" == type) {
                getImageSize(url, callback, objVals);
                return;
            }

            callback(url, objVals);
        }
    });
}
