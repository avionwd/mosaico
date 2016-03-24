"use strict";
/* global global: false */
var console = require("console");
var ko = require("knockout");
var $ = require("jquery");


var itrsActions = function (md, emailProcessorBackend) {
    var actionsPlugin = function (mdkey, mdname, viewModel) {

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

            saveAction(saveCmd);
        };
        var saveExitCmd = {
            name:    'Save and exit', // l10n happens in the template
            enabled: ko.observable(true)
        };
        saveExitCmd.execute = function () {
            saveExitCmd.enabled(false);
            viewModel.metadata.changed = Date.now();
            if (typeof viewModel.metadata.key == 'undefined') {
                console.warn("Unable to find ket in metadata object...", viewModel.metadata);
                viewModel.metadata.key = mdkey;
            }

            saveAction(saveExitCmd);

            var backUrl = $('body').data('back-url');
            if (backUrl) global.document.location = backUrl;
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

            $('#testSendModal').modal();
            $('.ui-tooltip').remove();

            $('#testSendForm').submit(function (e) {
                e.preventDefault();

                var email = $.trim($('#testSendEmail').val());

                if (!email) return;

                $('#testSendModal').modal('hide');
                $.ajax('/send', {
                    data: {
                        email: email,
                        html: viewModel.exportHTML()
                    },
                    type: 'POST',
                    dataType: 'json',
                    success: function (response) {
                        console.log(response);
                        if (response.status) {
                            viewModel.notifier.success(response.message);
                        } else {
                            var message = response.message || viewModel.ut('template', 'Test send Error');
                            viewModel.notifier.error(message);
                        }
                    },
                    error: function (response) {
                        viewModel.notifier.error(viewModel.ut('template', 'Test send Error'));
                    },
                    complete: function() {
                        testCmd.enabled(true);
                    }
                });
            });




            //console.log('HTML ======================================================');
            //console.log(viewModel.exportHTML());
            //console.log('===========================================================');
            // todo this enable must be in the test mailing promise

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

        var saveAction = function (command) {
            $.ajax('/save', {
                data: {
                    meta: viewModel.exportMetadata(),
                    json: viewModel.exportJSON(),
                    html: viewModel.exportHTML()
                },
                type: 'POST',
                dataType: 'json',
                success: function (response) {
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
                    command.enabled(true);
                }
            });
        };

        viewModel.save = saveCmd;
        viewModel.saveExit = saveExitCmd;
        viewModel.test = testCmd;
        //viewModel.download = downloadCmd;
    }.bind(undefined, md.key, md.name);

    return actionsPlugin;
};

module.exports = itrsActions;