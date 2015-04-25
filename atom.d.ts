/// <reference path="./atom-generate.d.ts" />

declare module AtomTypes {
    // https://github.com/atom/atom/issues/4940
    class Package {}
}

declare module "atom" {
    export = AtomTypes;
}

interface Window {
    atom: AtomTypes.Atom;
    measure(description:string, fn:Function):any; // return fn result
    profile(description:string, fn:Function):any; // return fn result
}

// TODO WorkspaceView is missing in document.
