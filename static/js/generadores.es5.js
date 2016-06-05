(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
(function () {

  var SOURCE_ID = void 0;
  var getRemoteFromUrl = function getRemoteFromUrl(rawUrl) {
    var url = parseURL(rawUrl);
    return url && url.params ? url.params.id : '';
  };

  var parseURL = function parseURL(url) {
    var a = document.createElement('a');
    a.href = url;
    return {
      source: url,
      protocol: a.protocol.replace(':', ''),
      host: a.hostname,
      port: a.port,
      query: a.search,
      params: function () {
        var ret = {},
            seg = a.search.replace(/^\?/, '').split('&'),
            len = seg.length,
            i = 0,
            s;
        for (; i < len; i++) {
          if (!seg[i]) {
            continue;
          }
          s = seg[i].split('=');
          ret[s[0]] = s[1];
        }
        return ret;
      }(),
      file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
      hash: a.hash.replace('#', ''),
      path: a.pathname.replace(/^([^\/])/, '/$1'),
      relative: (a.href.match(/tp:\/\/[^\/]+(.+)/) || [, ''])[1],
      segments: a.pathname.replace(/^\//, '').split('/')
    };
  };

  var showError = function showError(err) {
    return $.simplyToast(err, 'danger');
  };
  var alertOk = function alertOk(msg) {
    return $.simplyToast(msg, 'success');
  };

  var base = parseURL(window.location.url);

  var $tpls = $('#tpls');
  var $sources = $('#sources');
  var $btnRegen = $('#btn-regen');
  var $output = $('#runner-output');
  var $examples = $('#generator-examples');
  var $generator = $('#generator');
  var $tableName = $('#generator-name');
  var $tableDesc = $('#generator-desc');

  var generador = void 0;

  var gen = new Generador({
    host: '//' + base.host + (base.port ? ':' + base.port : '')
  });

  var getTpls = function getTpls(src) {
    if (!src.match(/;@tpl\|/m)) {
      return ';@tpl|main\n' + src;
    }
    return src;
  };

  var restartGenerator = function restartGenerator() {
    var tpls = getTpls($tpls.val());
    generador = gen.parseString('' + tpls + $sources.val());
  };
  var runGenerator = function runGenerator() {
    $output.empty().append(gen.toHtml(generador.generate()));
  };

  var redirectToGenerator = function redirectToGenerator(id) {
    window.location.href = '/generadores/?id=' + id;
  };

  var saveContent = function saveContent(sourceId) {
    var name = $tableName.val().trim();
    var desc = $tableDesc.val().trim();
    if (!name || !desc) {
      showError('Falta nombre o descripcion');
      return;
    }
    gen.remotes.update(sourceId, {
      name: name, desc: desc,
      data: {
        tpls: getTpls($tpls.val()),
        tables: $sources.val()
      }
    }).then(function (res) {
      alertOk('Guardado con exito');
    }).catch(function (err) {
      showError(err.message);
    });
  };

  var forkContent = function forkContent(sourceId) {
    var name = $tableName.val().trim();
    var desc = $tableDesc.val().trim();
    if (!name || !desc) {
      showError('Falta nombre o descripcion');
      return;
    }

    gen.remotes.create({
      name: name, desc: desc,
      parent: sourceId,
      data: {
        tpls: getTpls($tpls.val()),
        tables: $sources.val()
      }
    }).then(function (res) {
      alertOk('Guardado con exito');
      console.log('RES', res);
      setTimeout(function () {
        redirectToGenerator(res.tableId);
      }, 400);
    }).catch(function (err) {
      showError(err.message);
    });
  };

  var enableLoggedUI = function enableLoggedUI() {
    $('#save').removeClass('disabled').off('click').on('click', function () {
      return saveContent(SOURCE_ID);
    });
    $('#fork').removeClass('disabled').off('click').on('click', function () {
      return forkContent(SOURCE_ID);
    });
  };

  var showGenerator = function showGenerator(sourceId) {

    $generator.removeClass('hide');

    $tpls.on('change', restartGenerator);
    $sources.on('change', restartGenerator);
    $btnRegen.on('click', runGenerator);

    gen.remotes.load(sourceId).then(function (res) {

      if (!res) {
        showError('No hay datos para el identificador ' + sourceId);
        return;
      }
      $tableName.val(res.name);
      $tableDesc.val(res.desc);
      $tpls.val(getTpls(res.data.tpls));
      $sources.val(res.data.tables);
      restartGenerator();
      runGenerator();
    }).catch(function (err) {
      showError('No hay datos para el identificador ' + sourceId);
    });
  };

  $(function () {

    SOURCE_ID = getRemoteFromUrl(window.location.href);

    if (!SOURCE_ID) {
      $examples.removeClass('hide');
      return;
    }

    showGenerator(SOURCE_ID);

    var clipboard = new Clipboard('#btn-copy');
    clipboard.on('success', function (e) {
      alertOk('Copiado al portapapeles');
      e.clearSelection();
    });

    gen.getTokenFromAuth().then(function (token) {
      enableLoggedUI();
    }).catch(function (err) {});
  });
})();

},{}]},{},[1]);
