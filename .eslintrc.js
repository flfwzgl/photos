module.exports = {
    root: true,

    parserOptions: {
        parser: 'babel-eslint',
        ecmaVersion: 2018,
        sourceType: 'module'
    },

    env: {
        browser: true,
        commonjs: true,
    },
    
    rules: {
        "vue/no-unused-vars": 0,
        "indent": [2, 'tab', {"SwitchCase": 1}],
        "eqeqeq": 2,
        "space-before-function-paren": 2,
        // "semi": 2
        "key-spacing": [2, {
            "beforeColon": false,
            "afterColon": true
        }],
        "no-octal": 2,
        "no-redeclare": 2,
        "comma-spacing": 2,
        "no-new-object": 2,
        "arrow-spacing": 2,
        "quotes": [2, "single", {
            "avoidEscape": true,
            "allowTemplateLiterals": true
        }],
        "require-await": 2
    }
}