/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/typescript/typescript.d.ts" />
/// <reference path="../node_modules/typescript-formatter/typescript-formatter.d.ts" />
/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../typings/json-patch/json-patch.d.ts" />

/// <reference path="../fixture/api-docs.d.ts" />

import tsfmt = require("typescript-formatter");
import meta = require("./meta");

class Emitter {
    def = "";

    constructor(public meta:AtomDocTypes.Metadata) {
    }

    emit():Promise<string> {
        this.def = `declare module "atom" {\n`;

        Object.keys(meta.classes).forEach(clazzName => {
            let clazz = meta.classes[clazzName];
            this.emitClass(clazz);
        });

        this.def += "}\n";

        return tsfmt
            .processString("tmp.ts", this.def, {
                dryRun: true,
                replace: false,
                tslint: false,
                editorconfig: false,
                tsfmt: true
            })
            .then(result => result.dest);
    }

    emitClass(clazz:AtomDocTypes.ClassInfo) {
        this.def += `/**\n`;
        if (clazz.description) {
            this.def += this.toJSDocLine(clazz.description);
            this.def += ` *\n`;
        }
        this.def += ` * file: ${clazz.filename}\n`;
        this.def += ` * srcUrl: ${clazz.srcUrl}\n`;
        this.def += ` */\n`;
        this.def += `class ${clazz.name} `;
        if (clazz.superClass && clazz.superClass !== "Model") {
            this.def += `extends ${clazz.superClass} `;
        }
        this.def += "{ \n";

        clazz.classProperties.forEach(property=> this.emitProperty(property, "static"));
        if (clazz.classProperties && clazz.classProperties.length !== 0) {
            this.def += "\n";
        }

        clazz.instanceProperties.forEach(property => this.emitProperty(property, ""));
        if (clazz.instanceProperties && clazz.instanceProperties.length !== 0) {
            this.def += "\n";
        }

        clazz.classMethods.forEach(method => this.emitMethod(method, "static"));
        if (clazz.classMethods && clazz.classMethods.length !== 0) {
            this.def += "\n";
        }

        clazz.instanceMethods.forEach(method => this.emitMethod(method, ""));

        this.def += "}\n\n";
    }

    emitProperty(property:AtomDocTypes.Property, modifier:string) {
        this.def += `/**\n`;
        if (property.description) {
            this.def += this.toJSDocLine(property.description);
        }
        this.def += ` */\n`;
        this.def += `\t${modifier} ${property.name}: `;
        if (property.summary) {
            let reArray = /\{(.*)\}/.exec(property.summary);
            if (reArray && 2 <= reArray.length) {
                this.def += reArray[1];
            } else {
                this.def += "any";
            }
        } else {
            this.def += "any";
        }
        this.def += ";\n";
    }

    emitMethod(method:AtomDocTypes.Method, modifier:string) {
        this.def += `/**\n`;
        if (method.description) {
            this.def += this.toJSDocLine(method.description);
        }
        if (method.arguments) {
            method.arguments.forEach(arg => {
                this.def += ` * @param ${arg.type ? "{" + this.toTSType(arg.type) + "}" : ""} ${arg.description}\n`;
            });
        }
        if (method.returnValues) {
            method.returnValues.forEach(ret => {
                this.def += ` * @returns ${ret.type ? "{" + this.toTSType(ret.type) + "}" : ""} ${ret.description}\n`;
            });
        }
        this.def += ` */\n`;

        this.def += `\t${modifier} ${method.name}(`;
        if (method.arguments) {
            method.arguments.forEach((arg, idx, array) => {
                this.def += `${arg.name}${arg.isOptional ? "?" : ""}: ${this.toTSType(arg.type) }`;
                if (idx < array.length - 1) {
                    this.def += ", ";
                }
            });
        }
        if (method.name === "constructor") {
            this.def += ");\n";
            return;
        }
        this.def += "): ";
        if (!method.returnValues || method.returnValues.length === 0) {
            this.def += "void";
        } else {
            this.def += this.returnTypes(method.returnValues);
        }
        this.def += ";\n";
    }

    returnTypes(returnValues:AtomDocTypes.ReturnValue[]):string {
        let set = new Set<string>();
        returnValues.filter(ret => !!ret.type).forEach(ret => {
            set.add(this.toTSType(ret.type));
        });

        let result:string[] = [];
        set.forEach(v => result.push(v));
        if (result.length === 0) {
            result.push("any");
        }
        return result.join(" | ");
    }

    toTSType(typeName:string):string {
        if (!typeName) {
            return "any";
        } else if (typeName === "Array") {
            return "any[]";
        } else if (typeName === "array") {
            return "any[]";
        } else if (typeName === "Promise") {
            return "Promise<any>";
        } else if (typeName === "Number") {
            return "number";
        } else if (typeName === "String") {
            return "string";
        } else if (typeName === "Boolean") {
            return "boolean";
        } else if (typeName === "Bool") {
            return "boolean";
        }

        return typeName;
    }

    toJSDocLine(str:string):string {
        return str.split("\n").map(str => ` * ${str}\n`).join("");
    }
}

new Emitter(meta).emit().then(def => console.log(def));
