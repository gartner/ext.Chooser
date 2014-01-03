/**
 * Created with JetBrains PhpStorm.
 * User: Mads
 * Date: 28-12-12
 * Time: 11:43
 * To change this template use File | Settings | File Templates.
 */
/*
Ext.require([
    'Ext.tree.*',
    'Ext.grid.*',
    'Ext.data.*',
    'Ext.util.*',
    'Ext.view.View',
    'Ext.window.*'
]);
*/
Chooser = function(config)
{
    var TYPE_IMAGE = 'image', // Image-chooser
        TYPE_FILES = 'media', // File-chooser
        TYPE_LINKS = 'file'  // Links-chooser
    ;
    var _config = {
        type: TYPE_IMAGE,
        /**
         * Basic values to set for the window.
         * However, the object stores here in window is merged with the setup
         * done for the window, so anything that an Ext.window.Window can take, you
         * can put here and it will be applied.
         */
        window: {
            width: 600,
            height: 400,
            draggable: true,
            closable: true,
            modal: true,
            resizable: true,
            title: 'Select image'
        },
        data: {
            template: [
                '<tpl for=".">',
                '<div class="thumb-wrap" id="{id}">',
                '<div class="thumb"><img src="{url}" title="{name}"></div>',
                '<span>{shortName}</span></div>',
                '</tpl>',
                '<div class="x-clear"></div>'
            ],
            itemSelector: 'div.thumb-wrap'
        },
        /**
         * This url is used to get contents of the tree
         * Should return json like:
         * { success: true|false,
         *   children: [
         *      {id: <id>, url: <url>, leaf: true|false, text: <text to display>, children: <number of children> },
         *      { .... }
         *   ]
         * }
         *
         * The <url> is added to the request as the node-parameter, to let the code know which
         * directory to get nodes for:
         * treeUrl?node=<url>
         */
        treeUrl: '/ajax/imagetags/format/json/',
        treeModel: 'chooser.Tree',
        /**
         * This url is used to get the content for the selected node in the tree.
         * This is a plain array of objects:
         * [
         *  { id: <id>,
         *    url: <url to the resource>,
         *    name: <label to display>,
         *    type: <type of file, eg. 'jpeg' ...>,
         *    size: <size in bytes of resource, if applicable>,
         *    lastmodified: <unix timestamp of this resource>
         *  },
         *  ...
         * ]
         *
         * This url is added with the directory-parameter of the selected node in
         * the tree: <dataUrl>?directory=<value of tree-node>
         */
        dataUrl: '/ajax/images/format/json',
        dataModel: 'chooser.Image',
        multiSelect: false,
        okFunction: function(nodes)
        {
            console.log(nodes);
        },
        cancelFunction: function()
        {
            console.log('You cancelled!');
        }
    };

    Ext.Object.merge(_config, config);

    Ext.define('chooser.Image', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name', type: 'string'},
            {name: 'size', type: 'float'},
            {name: 'type', type: 'string'},
            {name: 'url',  type: 'string'},
            {name: 'id',   type: 'string'},
            {name: 'lastmodified', type: 'date', dateFormat: 'timestamp'}
        ]
    });

    Ext.define('chooser.Tree', {
        extend: 'Ext.data.Model',
        fields: [
            { name: 'url',      type: 'string'},
            { name: 'count',    type: 'int'},
            { name: 'text',     type: 'string'}
        ]
    });

    var selectedNodes
    ;

    return {

        treeStore: Ext.create('Ext.data.TreeStore', {
            model: _config.treeModel,
            proxy: {
                type: 'ajax',
                url: _config.treeUrl,
                reader: {
                    type: 'json',
                    root: 'children',
                    successProperty: 'success'
                }
            },
            folderSort: true,
            root: {
                name: 'All tags',
                expanded: true,
                id: 'source'
            },
            sorters: [{
                property: 'text',
                directrion: 'ASC'
            }]
        }),

        dataStore: Ext.create('Ext.data.Store', {
            id: 'imagesStore',
            model: _config.dataModel,
            proxy: {
                type: 'ajax',
                url: _config.dataUrl,
                reader: {
                    type: 'json',
                    root: 'data',
                    successProperty: 'success'
                }
            },
            autoLoad: true
        }),

        /**
         * Called when selecting one or more images.
         * This then calls the user-supplied function, and closes the chooser
         */
        okCallback: function()
        {
            _config.okFunction(selectedNodes);
            this.up('window').close();
        },

        /**
         * Called when Cancel is selected
         * This then calls the user-supplied function, then closes the chooser.
         */
        cancelCallback: function()
        {
            _config.cancelFunction();
            this.up('window').close();
        },

        getView: function() {

            var view;

            if (TYPE_LINKS === _config.type || TYPE_FILES === _config.type) {
                // return a links-view (a grid)
                view = Ext.create('Ext.grid.Panel', {
                    title: 'Links',
                    viewConfig: {
                        emptyText: 'No links selected'
                    },
                    store: this.dataStore,
                    columns: [
                        { text: 'Name', dataIndex: 'name', width: 175 },
                        {
                            text: 'Url',
                            dataIndex: 'url',
                            width: 175,
                            renderer: function(value, p , record) {
                                return Ext.String.format(
                                    '<a href="{0}" target="_blank">{0}</a>',
                                    value
                                );
                            }},
                        {
                            text: 'Date added',
                            dataIndex: 'lastmodified',
                            xtype: 'datecolumn',
                            format: 'd-m-Y H:m',
                            width: 110
                        },
                        { text: 'Type', dataIndex: 'type', width: 40 },
                        {
                            text: 'Size',
                            dataIndex: 'size',
                            width: 80,
                            align: 'right',
                            renderer: function(value) {
                                return value;
                            }
                        }
                    ],
                    listeners: {},
                    width: 580,
                    scroll: true,
                    region: 'center'
                });

            } else {

                view = Ext.create('Ext.view.View', {
                    id: 'images-view',
                    store: this.dataStore,
                    tpl: _config.data.template,
                    multiSelect: _config.multiSelect,
                    trackOver: true,
                    overItemCls: 'x-item-over',
                    itemSelector: _config.data.itemSelector,
                    emptyText: 'No images to display',
                    autoScroll: true,
                    prepareData: function(data) {
                        Ext.apply(data, {
                            shortName: Ext.util.Format.ellipsis(data.name, 17)
                        });
                        return data;
                    },
                    listeners: {},
                    region: 'center'
                });
            }

            // Same listeners for all views
            view.on({
                itemdblclick: {
                    fn: this.okCallback
                },
                selectionchange: function(dv, nodes ){
                    if (nodes.length > 0) {
                        Ext.getCmp('chooser-okButton').enable();
                    } else {
                        Ext.getCmp('chooser-okButton').disable();
                    }
                    selectedNodes = nodes;
                }
            });

            if (TYPE_IMAGE === _config.type) {
                return Ext.create('Ext.Panel', {
                    id: 'images-panel',
                    frame: true,
                    items: view,
                    title: 'Images',
                    region: 'center',
                    layout: 'fit',
                    shadow: false,
                    shadowOffset: 0
                });
            }

            return view;
        },

        window: {},

        show: function()
        {
            var tree = Ext.create('Ext.tree.Panel', {
                title: 'Folder',
                width: 150,
                frame: true,
                maxWidth: _config.window.width / 100 * 70,
                minWidth: 100,
                rootVisible: false,
                region: 'west',
                layout: 'fit',
                resizable: true,
                store: this.treeStore,
                useArrows: true,
                listeners: {
                    itemclick: {
                        scope: this,
                        fn: function(view, record)
                        {
                            this.dataStore.load({
                                params: {directory: record.get('url')}
                            });
                        }
                    }
                }
            });

            this.window = Ext.create('Ext.window.Window', Ext.Object.merge({
                id: 'chooser-window',
                layout: 'border',
                shadow: false,
                shadowOffset: 0,
                items: [
                    tree,
                    this.getView()
                ],
                buttons: [{
                    text: 'Ok',
                    id: 'chooser-okButton',
                    disabled: true,
                    handler: this.okCallback
                },{
                    text: 'Cancel',
                    handler: this.cancelCallback
                }]
            }, _config.window));

            this.window.show();
        }
    };

};
