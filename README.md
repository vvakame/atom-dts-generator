# Atom .d.ts generator

## How to generate Atom's api json

```
$ git clone git@github.com:atom/atom.git
$ cd atom
$ npm install
$ cd build
$ npm install
$ grunt build-docs
$ cd ../
$ ls -la la docs/output/api.json
```

## How to generate

```
$ ./setup.sh
$ grunt
$ npm run gen
$ tsc --noImplicitAny --module commonjs atom.d.ts
```
