function objectKeys (obj) {
  if (!__mpx_wxs__) {
    return Object.keys(obj)
  } else {
    var keys = []
    var stackMap = {
      '{': '}',
      '[': ']',
      '(': ')'
    }
    var shiftMap = {
      'n': '\n',
      'b': '\b',
      'f': '\f',
      'r': '\r',
      't': '\t'
    }
    if (typeof obj === 'object') {
      var objStr = JSON.stringify(obj)
      if (objStr[0] === '{' && objStr[objStr.length - 1] === '}') {
        var key = ''
        var inKey = true
        var stack = []
        var shift = false
        for (var i = 1; i < objStr.length - 1; i++) {
          var item = objStr[i]
          if (inKey) {
            if (item === ':') {
              keys.push(key.slice(1, -1))
              key = ''
              inKey = false
            } else {
              if (shift === false && item === '\\') {
                shift = true
                continue
              }
              if (shift) {
                item = shiftMap[item] || item
                shift = false
              }
              key += item
            }
          } else {
            if (stackMap[item]) {
              stack.push(item)
            } else if (stackMap[stack[stack.length - 1]] === item) {
              stack.pop()
            } else if (stack.length === 0 && item === ',') {
              inKey = true
            }
          }
        }
      }
    }
    return keys
  }
}

function genRegExp (str, flags) {
  if (!__mpx_wxs__) {
    return new RegExp(str, flags)
  } else {
    return getRegExp(str, flags)
  }
}

function extend (target, from) {
  var fromKeys = objectKeys(from)
  for (var i = 0; i < fromKeys.length; i++) {
    var key = fromKeys[i]
    target[key] = from[key]
  }
  return target
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

function likeArray (arr) {
  if (!__mpx_wxs__) {
    return Array.isArray(arr)
  } else {
    return arr && arr.constructor === 'Array'
  }
}

function isDef (v) {
  return v !== undefined && v !== null
}

function _stringifyClass (value) {
  if (!value) return ''
  if (likeArray(value)) {
    return stringifyArray(value)
  }
  if (isObject(value)) {
    return stringifyObject(value)
  }
  if (typeof value === 'string') {
    return value
  }
  return ''
}

function stringifyArray (value) {
  var res = ''
  var stringified
  for (var i = 0; i < value.length; i++) {
    if (isDef(stringified = _stringifyClass(value[i])) && stringified !== '') {
      if (res) res += ' '
      res += stringified
    }
  }
  return res
}

var mpxDashReg = genRegExp('(.+)MpxDash$')

function stringifyObject (value) {
  var res = ''
  var objKeys = objectKeys(value)
  for (var i = 0; i < objKeys.length; i++) {
    var key = objKeys[i]
    if (value[key]) {
      if (res) res += ' '
      if (mpxDashReg.test(key)) {
        key = hump2dash(mpxDashReg.exec(key)[1])
      }
      res += key
    }
  }
  return res
}

function hump2dash (value) {
  var reg = genRegExp('[A-Z]', 'g')
  return value.replace(reg, function (match) {
    return '-' + match.toLowerCase()
  })
}

function dash2hump (value) {
  var reg = genRegExp('-([a-z])', 'g')
  return value.replace(reg, function (match, p1) {
    return p1.toUpperCase()
  })
}

function parseStyleText (cssText) {
  var res = {}
  var listDelimiter = genRegExp(';(?![^(]*[)])', 'g')
  var propertyDelimiter = genRegExp(':(.+)')
  var arr = cssText.split(listDelimiter)
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i]
    if (item) {
      var tmp = item.split(propertyDelimiter)
      tmp.length > 1 && (res[dash2hump(tmp[0].trim())] = tmp[1].trim())
    }
  }
  return res
}

function genStyleText (styleObj) {
  var res = ''
  var objKeys = objectKeys(styleObj)

  for (var i = 0; i < objKeys.length; i++) {
    var key = objKeys[i]
    var item = styleObj[key]
    res += hump2dash(key) + ':' + item + ';'
  }
  return res
}

function mergeObjectArray (arr) {
  var res = {}
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

function normalizeDynamicStyle (value) {
  if (!value) return {}
  if (likeArray(value)) {
    return mergeObjectArray(value)
  }
  if (typeof value === 'string') {
    return parseStyleText(value)
  }
  return value
}

export function stringifyClass(staticClass, dynamicClass) {
  if (typeof staticClass !== 'string') {
    return console.log('Template attr class must be a string!')
  }
  return concat(staticClass, _stringifyClass(dynamicClass))
}

export function stringifyStyle(staticStyle, dynamicStyle, showStyle) {
  if (!showStyle) showStyle = {}
  var normalizedDynamicStyle = normalizeDynamicStyle(dynamicStyle)
  var parsedStaticStyle = typeof staticStyle === 'string' ? parseStyleText(staticStyle) : {}
  return genStyleText(extend(parsedStaticStyle, extend(normalizedDynamicStyle, showStyle)))
}
