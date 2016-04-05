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

            saveAction(saveCmd, false);
        };
        var saveAsCmd = {
            name:    'Save As Template', // l10n happens in the template
            enabled: ko.observable(true)
        };
        saveAsCmd.execute = function () {
            saveAsCmd.enabled(false);
            viewModel.metadata.changed = Date.now();
            if (typeof viewModel.metadata.key == 'undefined') {
                console.warn("Unable to find ket in metadata object...", viewModel.metadata);
                viewModel.metadata.key = mdkey;
            }
            $.ajax('/saveAs', {
                data: {
                    meta: viewModel.exportMetadata(),
                    json: viewModel.exportJSON(),
                    html: viewModel.exportHTML()
                },
                type: 'POST',
                dataType: 'json',
                success: function (response) {
                    viewModel.notifier.success(response.message);
                },
                error: function (response) {
                    viewModel.notifier.error(viewModel.ut('template', 'Template save Error'));
                },
                complete: function() {
                    saveAsCmd.enabled(true);
                }
            });
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



            saveAction(saveExitCmd, true);
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

            $('#testSendForm').off('submit').on('submit', function (e) {
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
                        if (response.status == 'success') {
                            viewModel.notifier.success(response.data.message);
                        } else if (response.status == 'error' && response.error && response.error.message) {
                            viewModel.notifier.error(response.error.message);
                        } else {
                            viewModel.notifier.error(viewModel.ut('template', 'Test send Error'));
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

        var saveAction = function (command, redirect) {
            $.ajax('/save', {
                data: {
                    meta: viewModel.exportMetadata(),
                    json: viewModel.exportJSON(),
                    html: viewModel.exportHTML()
                },
                type: 'POST',
                dataType: 'json',
                success: function (response) {
                    if (response.status == 'success') {
                        viewModel.notifier.success(response.data.message);
                        if (redirect && response.data.url) {
                            global.document.location = response.data.url;
                        }
                    } else if (response.status == 'error' && response.error && response.error.message) {
                        viewModel.notifier.error(response.error.message);
                    } else {
                        viewModel.notifier.error(viewModel.ut('template', 'Template save Error'));
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

        console.log(global.document.location);

        viewModel.save = saveCmd;
        viewModel.saveExit = saveExitCmd;
        viewModel.test = testCmd;

        // save as template mode
        if (global.document.location.pathname == '/test') {
            viewModel.saveAs = saveAsCmd;
        }

    }.bind(undefined, md.key, md.name);

    return actionsPlugin;
};

module.exports = itrsActions;