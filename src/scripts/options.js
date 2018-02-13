import $ from 'jquery';

const optionsGlobal = {
  backgroundPage: chrome.extension.getBackgroundPage().Extension,
};

const loadProfileData = () => {
  optionsGlobal.backgroundPage.getUserInfo().then((result) => {
    const userInfo = $('#userInfo');
    userInfo.find('[data-locale-value]').each((index, element) => {
      const textBox = $(element);
      const localValue = textBox.data('locale-value');
      textBox.text(chrome.i18n.getMessage(localValue));
    });
    userInfo.show();
    /* eslint-disable no-restricted-syntax */
    for (const profileData in result) {
      userInfo.find(`span[data-value-name='${profileData}']`).text(result[profileData]);
    }
    /* eslint-enable no-restricted-syntax */
  }, () => {
    $('#userInfo, #filters-settings').hide();
  });
};

const loadOptions = () => {
  optionsGlobal.backgroundPage.getOptions().then((items) => {
    const optionsForm = $('#options');
    /* eslint-disable no-restricted-syntax */
    for (const option in items) {
      const optionControl = optionsForm.find(`input[data-option-name='${option}']`);
      if (optionControl.attr('type') === 'checkbox') {
        optionControl.attr('checked', items[option]);
      } else {
        optionControl.val(items[option]);
      }
    }
    /* eslint-enable no-restricted-syntax */
    optionsForm.find('input').trigger('change');
  });

  $('#header').text(chrome.i18n.getMessage('FeedlyNotifierOptions'));
  $('#options').find('[data-locale-value]').each((index, element) => {
    const textBox = $(element);
    const localValue = textBox.data('locale-value');
    textBox.text(chrome.i18n.getMessage(localValue));
  });
};

const saveOptions = () => {
  const parseFilters = () => {
    const filters = [];
    $('#categories').find("input[type='checkbox']:checked").each((key, value) => {
      const checkbox = $(value);
      filters.push(checkbox.data('id'));
    });
    return filters;
  };

  const options = {};

  $('#options').find('input[data-option-name]').each((optionName, value) => {
    const optionControl = $(value);
    let optionValue;
    if (optionControl.attr('type') === 'checkbox') {
      optionValue = optionControl.is(':checked');
    } else if (optionControl.attr('type') === 'number') {
      optionValue = Number(optionControl.val());
    } else {
      optionValue = optionControl.val();
    }
    options[optionControl.data('option-name')] = optionValue;
  });

  options.filters = parseFilters();
  options.enableBackgroundMode = $('#enable-background-mode').is(':checked');
  options.showBlogIconInNotifications = $('#showBlogIconInNotifications').is(':checked');
  options.showThumbnailInNotifications = $('#showThumbnailInNotifications').is(':checked');

  optionsGlobal.backgroundPage.saveOptions(options).then(() => {
    alert(chrome.i18n.getMessage('OptionsSaved'));
  });
};

const loadUserCategories = () => {
  const appendCategory = (id, label) => {
    const categories = $('#categories');
    const $label = $(`<label for='${id}' class='label' />`).text(label);
    const $checkbox = $(`<input id='${id}' type='checkbox' />`).attr('data-id', id);
    categories.append($label);
    categories.append($checkbox);
    categories.append('<br/>');
  };

  optionsGlobal.backgroundPage.getUserCategories()
    .then((result) => {
      result.forEach((element) => {
        appendCategory(element.id, element.label);
      });
      appendCategory(optionsGlobal.backgroundPage.appGlobal.globalUncategorized, 'Uncategorized');
      optionsGlobal.backgroundPage.appGlobal.syncStorage.get('filters', (items) => {
        const filters = items.filters || [];
        filters.forEach((id) => {
          $('#categories').find(`input[data-id='${id}']`).attr('checked', 'checked');
        });
      });
    });
};

$(document).ready(() => {
  loadOptions();
  loadUserCategories();
  loadProfileData();
});

$('body').on('click', '#save', (e) => {
  const form = document.getElementById('options');
  if (form.checkValidity()) {
    e.preventDefault();
    saveOptions();
  }
});

$('body').on('click', '#logout', () => {
  optionsGlobal.backgroundPage.logout().then(() => {
    $('#userInfo, #filters-settings').hide();
  });
});

$('#options').on('change', 'input', () => {
  $('[data-disable-parent]').each((key, value) => {
    const child = $(value);
    const parent = $(`input[data-option-name='${child.data('disable-parent')}']`);
    if (parent.is(':checked')) {
      child.attr('disabled', 'disable');
    } else {
      child.removeAttr('disabled');
    }
  });

  $('[data-enable-parent]').each((key, value) => {
    const child = $(value);
    const parent = $(`input[data-option-name='${child.data('enable-parent')}']`);
    if (!parent.is(':checked')) {
      child.attr('disabled', 'disable');
    } else {
      child.removeAttr('disabled');
    }
  });
});
