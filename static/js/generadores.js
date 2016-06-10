'use strict'
;(function () {

  let SOURCE_ID
  const getRemoteFromUrl = rawUrl => {
    const url = parseURL(rawUrl)
    return (url && url.params) ? url.params.id : ''
  }

  const parseURL = url => {
    var a = document.createElement('a')
    a.href = url
    return {
      source: url,
      protocol: a.protocol.replace(':', ''),
      host: a.hostname,
      port: a.port,
      query: a.search,
      params: (function () {
        var ret = {},
          seg = a.search.replace(/^\?/,'').split('&'),
          len = seg.length, i = 0, s;
        for (;i<len;i++) {
          if (!seg[i]) { continue; }
          s = seg[i].split('=');
          ret[s[0]] = s[1];
        }
        return ret
      })(),
      file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
      hash: a.hash.replace('#', ''),
      path: a.pathname.replace(/^([^\/])/, '/$1'),
      relative: (a.href.match(/tp:\/\/[^\/]+(.+)/) || [, ''])[1],
      segments: a.pathname.replace(/^\//, '').split('/')
    }
  }

  const showError = err => $.simplyToast(err, 'danger')
  const alertOk = msg => $.simplyToast(msg, 'success')

  const base = parseURL(window.location.url)

  let STARTED = false
  const $tpls = $('#tpls')
  const $sources = $('#sources')
  const $btnRegen = $('#btn-regen')
  const $output = $('#runner-output')
  const $examples = $('#generator-examples')
  const $generator = $('#generator')
  const $tableName = $('#generator-name')
  const $tableDesc = $('#generator-desc')

  let generador

  const gen = new Generador({
    host: `//${base.host}${base.port ? ':'+ base.port : ''}`
  })

  const getTpls = src => {
    if (!src.match(/;@tpl\|/m)) {
      return `;@tpl|main\n${src}`
    }
    return src
  }

  const restartGenerator = () => {
    const tpls = getTpls($tpls.val())
    generador = gen.parseString(`${tpls}${$sources.val()}`).then(() => {
      STARTED = true
      runGenerator()
    })
  }
  const runGenerator = () => {
    if (!STARTED) return;

    $output.empty().append(gen.toHtml(gen.generate()))
  }

  const redirectToGenerator = id => {
    window.location.href = `/generadores/?id=${id}`
  }

  const saveContent = sourceId => {
    const name = $tableName.val().trim()
    const desc = $tableDesc.val().trim()
    if (!name || !desc) {
      showError('Falta nombre o descripcion')
      return
    }
    gen.remotes.update(sourceId, {
      name, desc,
      data: {
        tpls: getTpls($tpls.val()),
        tables: $sources.val()
      }
    }).then(res => {
      alertOk('Guardado con exito')
    })
      .catch(err => {
        showError(err.message)
      })
  }

  const forkContent = sourceId => {
    const name = $tableName.val().trim()
    const desc = $tableDesc.val().trim()
    if (!name || !desc) {
      showError('Falta nombre o descripcion')
      return
    }

    gen.remotes.create({
      name, desc,
      parent: sourceId,
      data: {
        tpls: getTpls($tpls.val()),
        tables: $sources.val()
      }
    }).then(res => {
      alertOk('Guardado con exito')
      console.log('RES', res)
      setTimeout(() => {
        redirectToGenerator(res.tableId)
      }, 400)
    })
      .catch(err => {
        showError(err.message)
      })
  }

  const enableLoggedUI = () => {
    $('#save').removeClass('disabled').off('click').on('click', () => saveContent(SOURCE_ID))
    $('#fork').removeClass('disabled').off('click').on('click', () => forkContent(SOURCE_ID))
  }

  const showGenerator = sourceId => {

    $generator.removeClass('hide')

    $tpls.on('change', restartGenerator)
    $sources.on('change', restartGenerator)
    $btnRegen.on('click', runGenerator)

    gen.remotes.load(sourceId).then(res => {

      if (!res) {
        showError(`No hay datos para el identificador ${sourceId}`)
        return
      }
      $tableName.val(res.name)
      $tableDesc.val(res.desc)
      $tpls.val(getTpls(res.data.tpls))
      $sources.val(res.data.tables)
      restartGenerator()
      runGenerator()
    })
      .catch(err => {
        showError(`No hay datos para el identificador ${sourceId}`)
      })

  }

  $(() => {


    SOURCE_ID = getRemoteFromUrl(window.location.href)

    if (!SOURCE_ID) {
      $examples.removeClass('hide')
      return
    }

    showGenerator(SOURCE_ID)

    const clipboard = new Clipboard('#btn-copy');
    clipboard.on('success', e => {
      alertOk('Copiado al portapapeles')
      e.clearSelection();
    });


    gen.getTokenFromAuth()
      .then(token => {
        enableLoggedUI()
      })
      .catch(err => {})
  })

}())
