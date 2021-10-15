import rewire from "rewire"
const vcode = rewire("@App/mooc/chaoxing/vcode")
const CxCourseFillVCode = vcode.__get__("CxCourseFillVCode")
// @ponicode
describe("Listen", () => {
    let inst: any

    beforeEach(() => {
        inst = new vcode.CxCourseVCode()
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.Listen(() => undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("GetImage", () => {
    let inst: any

    beforeEach(() => {
        inst = new CxCourseFillVCode(document.querySelector("img:first-of-type"), document.querySelector("span:first-of-type"))
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.GetImage()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("Fill", () => {
    let inst: any

    beforeEach(() => {
        inst = new CxCourseFillVCode(document.querySelector("img:first-of-type"), document.querySelector("div:first-of-type"))
    })

    test("0", () => {
        let callFunction: any = () => {
            inst.Fill("ok", "Warning: ", "function log(code) {\n        var args = [];\n        for (var _i = 1; _i < arguments.length; _i++) {\n            args[_i - 1] = arguments[_i];\n        }\n        console.log(utils.tr.apply(null, arguments));\n    }\n")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction: any = () => {
            inst.Fill("error", "Unknown Error", "function log(code) {\n        var args = [];\n        for (var _i = 1; _i < arguments.length; _i++) {\n            args[_i - 1] = arguments[_i];\n        }\n        console.log(utils.tr.apply(null, arguments));\n    }\n")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction: any = () => {
            inst.Fill("error", "The app does not exist", "function readToken_lt_gt(code) {\n\t      // '<>'\n\t      var next = this.input.charCodeAt(this.state.pos + 1);\n\t      var size = 1;\n\t\n\t      if (next === code) {\n\t        size = code === 62 && this.input.charCodeAt(this.state.pos + 2) === 62 ? 3 : 2;\n\t        if (this.input.charCodeAt(this.state.pos + size) === 61) return this.finishOp(_types.types.assign, size + 1);\n\t        return this.finishOp(_types.types.bitShift, size);\n\t      }\n\t\n\t      if (next === 33 && code === 60 && this.input.charCodeAt(this.state.pos + 2) === 45 && this.input.charCodeAt(this.state.pos + 3) === 45) {\n\t        if (this.inModule) this.unexpected();\n\t        // `<!--`, an XML-style comment that should be interpreted as a line comment\n\t        this.skipLineComment(4);\n\t        this.skipSpace();\n\t        return this.nextToken();\n\t      }\n\t\n\t      if (next === 61) {\n\t        // <= | >=\n\t        size = 2;\n\t      }\n\t\n\t      return this.finishOp(_types.types.relational, size);\n\t    }")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction: any = () => {
            inst.Fill("network", "TypeError exception should be raised", "function(code) {\n\t\t\t\treturn I.mode === 'client' || !Basic.arrayDiff(code, [200, 404]);\n\t\t\t}")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction: any = () => {
            inst.Fill("ok", "Grader id does not match submission id that was passed in", "function substr(start, length) {\n        return string_substr.call(\n            this,\n            start < 0 ? ((start = this.length + start) < 0 ? 0 : start) : start,\n            length\n        );\n    }")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction: any = () => {
            inst.Fill("network", "", "")
        }
    
        expect(callFunction).not.toThrow()
    })
})
