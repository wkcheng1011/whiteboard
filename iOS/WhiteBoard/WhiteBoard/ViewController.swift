//
//  ViewController.swift
//  WhiteBoard
//
//  Created by shingwai chan on 11/4/2021.
//  Copyright © 2021 WAI. All rights reserved.
//

import UIKit
import WebKit

class ViewController: UIViewController,WKUIDelegate,WKNavigationDelegate {
    var webView: WKWebView!
    
    override func loadView() {
        let webConfiguration = WKWebViewConfiguration()
        webView = WKWebView(frame: .zero, configuration: webConfiguration)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.backgroundColor = UIColor(red: 41/255.0, green: 43/255.0, blue: 44/255.0, alpha: 1)
        webView.allowsBackForwardNavigationGestures = true
        view = webView
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        let myURL = URL(string: "http://127.0.0.1:3000")
        let myRequest = URLRequest(url: myURL!)
        webView.load(myRequest)
        webView.scrollView.contentInsetAdjustmentBehavior = .never
    }


}

