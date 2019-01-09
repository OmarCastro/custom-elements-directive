import "./test/scenarios"
import test from 'tape'

test.onFinish(() => {
    console.log("closing...")   
    window.close()
});