'use strict'

const getRemoteFromUrl = rawUrl => {
  const url = parseURL(rawUrl)
  return (url && url.params) ? url.params.id : ''
}

const parseURL = url => {
  var a =  document.createElement('a');
  a.href = url;
  return {
    source: url,
    protocol: a.protocol.replace(':',''),
    host: a.hostname,
    port: a.port,
    query: a.search,
    params: (function(){
      var ret = {},
        seg = a.search.replace(/^\?/,'').split('&'),
        len = seg.length, i = 0, s;
      for (;i<len;i++) {
        if (!seg[i]) { continue; }
        s = seg[i].split('=');
        ret[s[0]] = s[1];
      }
      return ret;
    })(),
    file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
    hash: a.hash.replace('#',''),
    path: a.pathname.replace(/^([^\/])/,'/$1'),
    relative: (a.href.match(/tp:\/\/[^\/]+(.+)/) || [,''])[1],
    segments: a.pathname.replace(/^\//,'').split('/')
  };
}

const checkAuth = () => {
  return fetch('/auth/token', {
    headers: {"content-type": "application/json" },
    credentials: 'same-origin'
  })
    .then(res => res.json()).then(res => res ? res.token : null )
}

$(() => {
  let generador
  let TOKEN
  const $tpls = $('#tpls')
  const $sources = $('#sources')
  const $btnRegen = $('#btn-regen')
  const $output =  $('#runner-output')

  const SOURCE_ID = getRemoteFromUrl(window.location.href) || 'H1JTSHyN'

  const restartGenerator = () => generador = gen.init($tpls.val() + $sources.val())
  const exampleGenerator = () => $output.empty().append(gen.toHtml(generador.generators.semilla()))

  $tpls.on('change', restartGenerator)
  $sources.on('change', restartGenerator)
  $btnRegen.on('click', exampleGenerator)

  gen.remotes.load(SOURCE_ID).then(res => {

    if (!res) {
      alert(`No hay datos para el identificador ${SOURCE_ID}`)
      return
    }
    $tpls.val(res.data.tpls)
    $sources.val(res.data.tables)
    restartGenerator()
    exampleGenerator()
  })
    .catch(err => {
      alert(`No hay datos para el identificador ${SOURCE_ID}`)
      return
    })


  const saveContent = () => {
    gen.remotes.update(SOURCE_ID, {
      name: 'tabla',
      desc: 'desc',
      data: {
        tpls: $tpls.val(),
        tables: $sources.val()
      }
    }).then(res => {
      console.log('res')
      alert('Guardado con exito')
    })
      .catch(err => {
        alert(err.message)
      })
  }
  const enableLoggedUI = () => {
    $('#save').removeClass('disabled').off('click').on('click', saveContent)

  }
  checkAuth()
    .then(token => {
      TOKEN = token
      gen.remotes.setToken(token)
      enableLoggedUI()
    })
    .then(res => console.log(res))

})
