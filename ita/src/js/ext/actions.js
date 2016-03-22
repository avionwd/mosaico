"use strict";
/* global global: false */
var console = require("console");
var ko = require("knockout");
var $ = require("jquery");


var itrsActions = function (md, emailProcessorBackend) {
    var actionsPlugin = function (mdkey, mdname, viewModel) {

        // console.log("loading from metadata", md, model);
        var saveCmd = {
            name:    'Save', // l10n happens in the template
            enabled: ko.observable(true)
        };
        saveCmd.execute = function () {
            saveCmd.enabled(false);
            viewModel.metadata.changed = Date.now();
            if (typeof viewModel.metadata.key == 'undefined') {
                console.warn("Unable to find ket in metadata object...", viewModel.metadata);
                viewModel.metadata.key = mdkey;
            }

            /* TODO make real save process
             data = {
             metadata: viewModel.exportMetadata(),
             content: viewModel.exportJSON()
             }
             */
            //console.log('Metadata:');
            //console.log(viewModel.exportMetadata());
            //console.log('Content --------------------------------------');
            //console.log(viewModel.exportJSON());
            //console.log('----------------------------------------------');

            $.ajax('/save', {
                data: {
                    meta: viewModel.exportMetadata(),
                    json: viewModel.exportJSON(),
                    html: viewModel.exportHTML()
                },
                type: 'POST',
                dataType: 'json',
                success: function (response) {
                    console.log(response);
                    if (response.status) {
                        viewModel.notifier.success(response.message);
                    } else {
                        var message = response.message || viewModel.ut('template', 'Template save Error');
                        viewModel.notifier.error(message);
                    }
                },
                error: function (response) {
                   viewModel.notifier.error(viewModel.ut('template', 'Template save Error'));
                },
                complete: function() {
                    saveCmd.enabled(true);
                }
            });

            //global.localStorage.setItem("metadata-" + mdkey, viewModel.exportMetadata());
            //global.localStorage.setItem("template-" + mdkey, viewModel.exportJSON());
        };
        var testCmd = {
            name:    'Test', // l10n happens in the template
            enabled: ko.observable(true)
        };
        testCmd.execute = function () {
            testCmd.enabled(false);

            /* TODO make email testing
             html = viewModel.exportHTML();
             */

            console.log('HTML ======================================================');
            console.log(viewModel.exportHTML());
            console.log('===========================================================');

            /*
             var email = global.localStorage.getItem("testemail");
             if (email === null || email == 'null') email = viewModel.t('Insert here the recipient email address');
             email = global.prompt(viewModel.t("Test email address"), email);
             if (email.match(/@/)) {

             global.localStorage.setItem("testemail", email);
             console.log("TODO testing...", email);
             var postUrl = emailProcessorBackend ? emailProcessorBackend : '/dl/';
             var post = $.post(postUrl, {
             action: 'email',
             rcpt: email,
             subject: "[test] " + mdkey + " - " + mdname,
             html: viewModel.exportHTML()
             }, null, 'html');
             post.fail(function() {
             console.log("fail", arguments);
             viewModel.notifier.error(viewModel.t('Unexpected error talking to server: contact us!'));
             });
             post.success(function() {
             console.log("success", arguments);
             viewModel.notifier.success(viewModel.t("Test email sent..."));
             });
             post.always(function() {
             testCmd.enabled(true);
             });
             } else {
             global.alert(viewModel.t('Invalid email address'));
             testCmd.enabled(true);
             }
             */

            // todo this enable must be in the test mailing promise
            testCmd.enabled(true);

        };
        var downloadCmd = {
            name:    'Download', // l10n happens in the template
            enabled: ko.observable(true)
        };
        downloadCmd.execute = function () {
            downloadCmd.enabled(false);

            // todo make real download function in need or remove viewModel.download

            viewModel.notifier.info(viewModel.t("Downloading..."));
            viewModel.exportHTMLtoTextarea('#downloadHtmlTextarea');
            var postUrl = emailProcessorBackend ? emailProcessorBackend : '/dl/';
            global.document.getElementById('downloadForm').setAttribute("action", postUrl);
            global.document.getElementById('downloadForm').submit();
            downloadCmd.enabled(true);
        };

        viewModel.save = saveCmd;
        viewModel.test = testCmd;
        //viewModel.download = downloadCmd;
    }.bind(undefined, md.key, md.name);

    return actionsPlugin;
};

module.exports = itrsActions;