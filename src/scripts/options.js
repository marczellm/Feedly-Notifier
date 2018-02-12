import $ from 'jquery';

var optionsGlobal = {
    backgroundPage: chrome.extension.getBackgroundPage().Extension
};

$(document).ready(function () {
    loadOptions();
    loadUserCategories();
    loadProfileData();
});

$("body").on("click", "#save", function (e) {
    var form = document.getElementById("options");
    if (form.checkValidity()) {
        e.preventDefault();
        saveOptions();
    }
});

$("body").on("click", "#logout", function () {
    optionsGlobal.backgroundPage.logout().then(function () {
        $("#userInfo, #filters-settings").hide();
    });
});

$("#options").on("change", "input", function () {
    $("[data-disable-parent]").each(function (key, value) {
        var child = $(value);
        var parent = $("input[data-option-name='" + child.data("disable-parent") + "']");
        parent.is(":checked") ? child.attr("disabled", "disable") : child.removeAttr("disabled");
    });

    $("[data-enable-parent]").each(function (key, value) {
        var child = $(value);
        var parent = $("input[data-option-name='" + child.data("enable-parent") + "']");
        !parent.is(":checked") ? child.attr("disabled", "disable") : child.removeAttr("disabled");
    });
});

function loadProfileData() {
    optionsGlobal.backgroundPage.getUserInfo().then(function (result) {
        var userInfo = $("#userInfo");
        userInfo.find("[data-locale-value]").each(function () {
            var textBox = $(this);
            var localValue = textBox.data("locale-value");
            textBox.text(chrome.i18n.getMessage(localValue));
        });
        userInfo.show();
        for (var profileData in result) {
            userInfo.find("span[data-value-name='" + profileData + "']").text(result[profileData]);
        }
    }, function () {
        $("#userInfo, #filters-settings").hide();
    });
}

function loadUserCategories(){
    optionsGlobal.backgroundPage.getUserCategories()
        .then(function (result) {
            result.forEach(function (element) {
                appendCategory(element.id, element.label);
            });
            appendCategory(optionsGlobal.backgroundPage.appGlobal.globalUncategorized, "Uncategorized");
            optionsGlobal.backgroundPage.appGlobal.syncStorage.get("filters", function (items) {
                let filters = items.filters || [];
                filters.forEach(function (id) {
                    $("#categories").find("input[data-id='" + id + "']").attr("checked", "checked");
                });
            });
        });
}

function appendCategory(id, label) {
    var categories = $("#categories");
    var $label = $("<label for='" + id + "' class='label' />").text(label);
    var $checkbox = $("<input id='" + id + "' type='checkbox' />").attr("data-id", id);
    categories.append($label);
    categories.append($checkbox);
    categories.append("<br/>");
}

function parseFilters() {
    var filters = [];
    $("#categories").find("input[type='checkbox']:checked").each(function (key, value) {
        var checkbox = $(value);
        filters.push(checkbox.data("id"));
    });
    return filters;
}

function loadOptions() {
    optionsGlobal.backgroundPage.getOptions().then((items) => {
        var optionsForm = $("#options");
        for (var option in items) {
            var optionControl = optionsForm.find("input[data-option-name='" + option + "']");
            if (optionControl.attr("type") === "checkbox") {
                optionControl.attr("checked", items[option]);
            } else {
                optionControl.val(items[option]);
            }
        }
        optionsForm.find("input").trigger("change");
    });

    $("#header").text(chrome.i18n.getMessage("FeedlyNotifierOptions"));
    $("#options").find("[data-locale-value]").each(function () {
        var textBox = $(this);
        var localValue = textBox.data("locale-value");
        textBox.text(chrome.i18n.getMessage(localValue));
    });
}

function saveOptions() {

    var options = {};

    $("#options").find("input[data-option-name]").each(function (optionName, value) {
        var optionControl = $(value);
        var optionValue;
        if (optionControl.attr("type") === "checkbox") {
            optionValue = optionControl.is(":checked");
        } else if (optionControl.attr("type") === "number") {
            optionValue = Number(optionControl.val());
        } else {
            optionValue = optionControl.val();
        }
        options[optionControl.data("option-name")] = optionValue;
    });

    options.filters = parseFilters();
    options.enableBackgroundMode = $("#enable-background-mode").is(":checked");
    options.showBlogIconInNotifications = $("#showBlogIconInNotifications").is(":checked");
    options.showThumbnailInNotifications = $("#showThumbnailInNotifications").is(":checked");

    optionsGlobal.backgroundPage.saveOptions(options).then(() => {
        alert(chrome.i18n.getMessage("OptionsSaved"));
    });
}