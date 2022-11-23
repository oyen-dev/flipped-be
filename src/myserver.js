const methods = require('methods')
const express = require('express')
const { isAsyncFunction } = require('util/types')

const slice = Array.prototype.slice

const handleAsyncFunctionError = (args) => {
  if (args.length > 1 && (isAsyncFunction(args[1]) || args[1].constructor.name === 'AsyncFunction')) {
    const newArgs = [
      ...args
    ]
    newArgs[1] = (req, res, next) => {
      args[1](req, res, next).catch(err => next(err))
    }
    return newArgs
  }
  return args
}

function MyServer () {
  const server = express()

  methods.forEach(function (method) {
    server[method] = function (path) {
      if (method === 'get' && arguments.length === 1) {
        return this.set(path)
      }

      const newArgs = handleAsyncFunctionError(arguments)

      this.lazyrouter()
      const route = this._router.route(path)
      route[method].apply(route, slice.call(newArgs, 1))
      return this
    }
  })

  server.all = function all (path) {
    this.lazyrouter()

    const route = this._router.route(path)

    const newArgs = handleAsyncFunctionError(arguments)

    const args = slice.call(newArgs, 1)

    for (let i = 0; i < methods.length; i++) {
      route[methods[i]].apply(route, args)
    }

    return this
  }

  return server
}

function MyRouter (options) {
  const router = express.Router(options)
  methods.concat('all').forEach(function (method) {
    router[method] = function (path) {
      const route = this.route(path)

      const newArgs = handleAsyncFunctionError(arguments)

      route[method].apply(route, slice.call(newArgs, 1))
      return this
    }
  })
  return router
}

module.exports = {
  MyServer,
  MyRouter
}

/*
if(arguments.length > 1 && isAsyncFunction(arguments[1])) {
      arguments[1] = (req, res, next) => {
        arguments[1].catch(err => next(err))
      }
    }
*/
