'use strict'

import marked from 'marked'

import { alertOk, showError } from './toast'

import { getRemoteFromUrl } from './utils/index'

const getTpls = src => {
  if (!src.match(/;@tpl\|/m)) {
    return `;@tpl|main\n${src}`
  }
  return src
}

const redirectAfter = generator => {
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

const startClipboard = () => {
  const clipboard = new Clipboard('#btn-copy');
  clipboard.on('success', e => {
    alertOk('Copiado al portapapeles')
    e.clearSelection();
  });
}

let GENERATOR

export default obj => {

  return {
    init: () => {

      let USER_LOGGEDIN = false
      const $tpls = $('#tpls')
      const $sources = $('#sources')
      const $btnRegen = $('#btn-regen')
      const $output = $('#runner-output')
      const $tableName = $('#generator-name')
      const $tableTitle = $('#generator-title')
      const $tableDesc = $('#generator-desc')
      const $btnPrint = $('#print')
      const $owned = $('#generator-owned').val()

      const SOURCE_ID = GENERATOR_SOURCE_ID || getRemoteFromUrl(window.location.href)

      const enableLoggedUI = data => {
        if ($owned || SOURCE_ID === 'NEW') {
          $('#save').removeClass('disabled').off('click').on('click', () => saveContent(SOURCE_ID))
        }

        if (USER_LOGGEDIN) {
          $('#fork').removeClass('disabled').off('click').on('click', () => forkContent(SOURCE_ID))
        }

        if ($owned) {
          $('#remove').removeClass('disabled').off('click').on('click', () => removeContent(SOURCE_ID))

        }
      }

      const runGenerator = () => {
        $output.empty().append(marked(GENERATOR.generate()))
      }

      const restartGenerator = () => {
        GENERATOR.reset()
        return GENERATOR.addContent(`${getTpls($tpls.val())}${$sources.val()}`)
          .then(runGenerator)
      }

      const updateTitle = e => {
        $tableTitle.html($(e.target).val())
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
          id,
          name, desc,
          data: {
            tpls: getTpls($tpls.val()),
            tables: $sources.val()
          }
        }

        if (id) {
          return obj.save(content).then(res => {
            alertOk('Guardado con exito')
          })
            .catch(err => {
              showError(err.message)
            })
        }

        obj.save(content)
          .then(redirectAfter)
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

        obj.save({
          name, desc,
          parent: sourceId,
          data: {
            tpls: getTpls($tpls.val()),
            tables: $sources.val()
          }
        }).then(redirectAfter)
          .catch(err => {
            showError(err.message)
          })
      }

      const removeContent = sourceId => {

        const removeConfirmmation = confirm('Quieres borrar este generador? Esta accion no se puede deshacer.')

        if (!removeConfirmmation) {
          return
        }
        obj.remove(sourceId)
          .then(() => redirectAfter())
          .catch(err => {
            showError(err.message)
          })
      }

      $btnRegen.on('click', runGenerator)
      $btnPrint.on('click', () => {
        window.open('/generadores/imprimir?id=' + SOURCE_ID)
      })

      startClipboard()
      obj.auth.getTokenFromAuth()
        .then(token => {
          USER_LOGGEDIN = true
          $tpls.on('change', restartGenerator)
          $tableName.on('change', updateTitle)
          $sources.on('change', restartGenerator)
          $btnRegen.on('click', runGenerator)

          const content = `${getTpls($tpls.val())}${$sources.val()}`

          obj.create(content)
            .then(gen => {
              GENERATOR = gen
              $btnRegen.trigger('click')
            })

          enableLoggedUI()
        })
        .catch(err => {})
    }
  }


}
