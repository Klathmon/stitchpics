# paper-share-buttons

Web Componentand material implementation of social share buttons (facebook, twitter and google+).

## Demo & Documentation

> [Check it live](http://grvcoelho.github.io/paper-share-buttons).

## Install

Install the component using [Bower](http://bower.io/):

```sh
$ bower install paper-share-buttons --save
```

Or [download as ZIP](https://github.com/grvcoelho/paper-share-buttons/archive/master.zip).

## Dependencies

Element dependencies are managed via [Bower](http://bower.io/). You can
install that via:

    npm install -g bower

Then, go ahead and download the element's dependencies:

    bower install

## Usage

1. Import Web Components' polyfill:

    ```html
    <script src="bower_components/webcomponentsjs/webcomponents.js"></script>
    ```

2. Import Custom Elements:

    ```html
    <link rel="import" href="bower_components/paper-share-buttons/paper-share-facebook.html">
    <link rel="import" href="bower_components/paper-share-buttons/paper-share-twitter.html">
    <link rel="import" href="bower_components/paper-share-buttons/paper-share-google.html">
    ```

3. Start using it!

    ```html
    <paper-share-facebook></paper-share-facebook>
    <paper-share-twitter></paper-share-twitter>
    <paper-share-google></paper-share-google>
    ```

## Options

### Facebook

Attribute | Options                                 | Description
---       | ---                                     | ---
`href`    | *string*                                | The URL displayed on the post
`raised`  | *boolean*                               | Apply `raised` property to `paper-button`
`noink`   | *boolean*                               | Apply `noink` property to `paper-button`

### Twitter

Attribute | Options                                 | Description
---       | ---                                     | ---
`text`    | *string*                                | The text displayed on the tweet
`href`    | *string*                                | The URL displayed on the tweet
`user`    | *string*                                | The user displayed on the tweet and in the @mention
`raised`  | *boolean*                               | Apply `raised` property to `paper-button`
`noink`   | *boolean*                               | Apply `noink` property to `paper-button`

### Google

Attribute | Options                                 | Description
---       | ---                                     | ---
`href`    | *string*                                | The URL displayed on the post
`raised`  | *boolean*                               | Apply `raised` property to `paper-button`
`noink`   | *boolean*                               | Apply `noink` property to `paper-button`

## Development

If you wish to work on your element in isolation, we recommend that you use
[Polyserve](https://github.com/PolymerLabs/polyserve) to keep your element's
bower dependencies in line. You can install it via:

    npm install -g polyserve

And you can run it via:

    polyserve

Once running, you can preview your element at
`http://localhost:8080/components/paper-share-buttons/`


## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

[MIT License](http://grvcoelho.mit-license.org/) © Guilherme Rv Coelho
