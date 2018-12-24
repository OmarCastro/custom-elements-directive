import test from 'tape'
import parse from '../src/parser'


test("parse list of directives", t => {
    t.plan(1)
    t.deepEquals(parse("aa bb cc"), {aa: "", bb:"", cc:""})
})

test("multiple whitespaces ignored when parsing directives", t => {
    t.plan(1)
    t.deepEquals(parse("aa  bb      cc\ndd"), {aa: "", bb:"", cc:"", dd:""})
})

test("parse list of directives with params with single quotes", t => {
    t.plan(1)
    t.deepEquals(parse("aa='' bb='abc' cc='aa \\'bb'"), {aa: "", bb:"abc", cc:"aa 'bb"})
})


test("parse list of directives with params with double quotes", t => {
    t.plan(1)
    t.deepEquals(parse('aa="aaa" bb="" cc="aa \\"bb"'), {aa: "aaa", bb:"", cc:"aa \"bb"})
})

test("parse list of directives with params without quotes", t => {
    t.plan(1)
    t.deepEquals(parse('aa=aaa bb= cc=aa\\ bb'), {aa: "aaa", bb:"", cc:"aa bb"})
})