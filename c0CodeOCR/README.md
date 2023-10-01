# C0 Code OCR

![license MIT](https://img.shields.io/badge/license-MIT-blue)

> 2023 &copy; MaoHuPi
>
> Document language: English / [繁體中文](document/README.zh-TW.md)
>
> To use it online, please go to [C0 Code OCR (github page)](https://maohupi.github.io/c0CodeOCR/)

## Project use

### Introduction

This project is designed for the code of screenshots. It can be used to extract the code of the screenshot program and output it in text form.
In order to achieve higher recognition accuracy, adjustability and consistency of output results, the recognition function is processed by character image comparison instead of using convolutional neural networks for feature extraction and comparison. .

This project is a project that can be run on a pure client, so `index.html` can be opened directly in the browser without setting up a local server.

### environment

* Hardware: computer
* Software: (Choose one)
* Chrome >= 88
* Edge >= 88
* Safari >= 14
* Firefox >= 83
* Opera >= 74

### Function libraries used

* [Highlight.js v11.8.0](https://github.com/highlightjs/highlight.js/releases/tag/11.8.0)

## Optical character recognition

### Function

*Layout analysis: User manual cutting
* Character segmentation: first vertical and then horizontal line scanning
*Character recognition: Template matching that requires specified fonts
* Layout restoration: original lines, character order, filling in spaces, line breaks
* Post-processing: template replacement, case correction
* Result output: web page preview, text copy, file download

### Difference

* Get Code v1
* Method: Stretch the cut characters and compare them with the template to choose the most similar ones.
* Advantages: Quick identification.
* Disadvantage: `broken text` and `text with multiple horizontal components` will be recognized as multiple characters.
* Get Code v2
* Method: Take the number of characters that is similar to the length of the template to be compared, and after stretching and comparing, choose the most similar one.
* Advantages: It can more accurately identify broken text caused by screenshot quality or color filtering function and text with multiple horizontal components.
* Disadvantages: The total processing time is much slower than `v1`.

## new version update

* v1.0.0 2023/09/30 First Edition
* v1.0.1 2023/10/01 Processing and Display Errors
	* Fixed the rectangular font processing error during OCR data processing.
	* Added error message pop-up display.