export default function (accessToken) {
  this.accessToken = accessToken;

  const apiUrl = 'http://cloud.feedly.com/v3/';
  const secureApiUrl = 'https://cloud.feedly.com/v3/';
  const extensionVersion = chrome.runtime.getManifest().version;

  this.getMethodUrl = (methodName, parameters, useSecureConnection) => {
    if (methodName === undefined) {
      return '';
    }
    let methodUrl = (useSecureConnection ? secureApiUrl : apiUrl) + methodName;

    let queryString = '?';
    /* eslint-disable no-restricted-syntax */
    for (const parameterName in parameters) {
      queryString += `${parameterName}=${parameters[parameterName]}&`;
    }
    /* eslint-enable no-restricted-syntax */

    let browserPrefix;
    // @if BROWSER='chrome'
    browserPrefix = 'c';
    // @endif

    // @if BROWSER='opera'
    browserPrefix = 'o';
    // @endif

    // @if BROWSER='firefox'
    browserPrefix = 'f';
    // @endif

    queryString += `av=${browserPrefix}${extensionVersion}`;

    methodUrl += queryString;

    return methodUrl;
  };

  this.request = (methodName, settings) => {
    function status(response) {
      if (response.status === 200) {
        return Promise.resolve(response);
      }
      return Promise.reject(response);
    }

    function json(response) {
      return response.json().catch(() => {});
    }

    let url = this.getMethodUrl(methodName, settings.parameters, settings.useSecureConnection);
    const verb = settings.method || 'GET';

    // For bypassing the cache
    if (verb === 'GET') {
      url += `${(/\?/).test(url) ? '&' : '?'}ck=${(new Date()).getTime()}`;
    }

    const headers = {};
    if (this.accessToken) {
      headers.Authorization = `OAuth ${this.accessToken}`;
    }

    const requestParameters = {
      method: verb,
      headers,
    };

    if (settings.body) {
      requestParameters.body = JSON.stringify(settings.body);
    }

    return fetch(url, requestParameters)
      .then(status)
      .then(json);
  };
}

