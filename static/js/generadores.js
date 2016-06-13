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
  const $examples = $('#generator-featured, #generator-list')
  const $generator = $('#generator')
  const $tableName = $('#generator-name')
  const $tableTitle = $('#generator-title')
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

  const redirectAfterNew = generator => {
    let redirectUrl
    if (generator) {
      alertOk('Guardado con exito')
      redirectUrl = `${generator.link}?edit=1`
    } else {
      alertOk('Contenido eliminado con exito')
      redirectUrl = `/generadores/`
    }
    setTimeout(() => {
      window.location.href = redirectUrl
    }, 500)
  }

  const saveContent = sourceId => {
    const id = sourceId === 'NEW' ? '' : sourceId
    const name = $tableName.val().trim()
    const desc = $tableDesc.val().trim()
    if (!name || !desc) {
      showError('Falta nombre o descripcion')
      return
    }
    const content = {
      name, desc,
      data: {
        tpls: getTpls($tpls.val()),
        tables: $sources.val()
      }
    }

    if (id) {
      return gen.remotes.update(id, content).then(res => {
        alertOk('Guardado con exito')
      })
        .catch(err => {
          showError(err.message)
        })
    }

    gen.remotes.create(content)
      .then(redirectAfterNew)
      .catch(err => {
        showError(err.message)
      })
  }

  const forkContent = sourceId => {
    const name = `${$tableName.val().trim()} - copia`
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
    }).then(redirectAfterNew)
      .catch(err => {
        showError(err.message)
      })
  }

  const removeContent = sourceId => {

    const removeConfirmmation = confirm('Quieres borrar este generador? Esta accion no se puede deshacer.')

    if (!removeConfirmmation) {
      return
    }
    gen.remotes.remove(sourceId)
      .then(() => redirectAfterNew())
      .catch(err => {
        showError(err.message)
      })
  }

  const enableLoggedUI = data => {
    if (!data || SOURCE_ID === 'NEW') {
      $('#save').removeClass('disabled').off('click').on('click', () => saveContent(SOURCE_ID))
      return
    }

    $('#fork').removeClass('disabled').off('click').on('click', () => forkContent(SOURCE_ID))

    if (data.owned) {
      $('#remove').removeClass('disabled').off('click').on('click', () => removeContent(SOURCE_ID))

    }
  }
  
  const updateTitle = e => {
    $tableTitle.html($(e.target).val())
  }

  const showGenerator = sourceId => {

    $generator.removeClass('hide')

    $tpls.on('change', restartGenerator)
    $tableName.on('change', updateTitle)
    $sources.on('change', restartGenerator)
    $btnRegen.on('click', runGenerator)

    if (sourceId === 'NEW') {
      restartGenerator()
      return
    }

    gen.remotes.load(sourceId).then(res => {
      return res || Promise.reject(`No hay datos para el identificador ${sourceId}`)
    })
      .then(res => {
        $tableName.val(res.name)
        $tableDesc.val(res.desc)
        $tpls.val(getTpls(res.data.tpls))
        $sources.val(res.data.tables)
        enableLoggedUI(res)
        restartGenerator()
        runGenerator()
      })
      .catch(err => {
        showError(`No hay datos para el identificador ${sourceId}`)
      })

  }

  $(() => {


    SOURCE_ID = GENERATOR_SOURCE_ID || getRemoteFromUrl(window.location.href)

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
