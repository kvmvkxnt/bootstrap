const findElement = (selector, node = document) => {
    return node.querySelector(selector);
}

const findElements = (selector, node = document) => {
    return node.querySelectorAll(selector);
}