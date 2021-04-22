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
//    var webView: WKWebView!
    @IBOutlet weak var activityView: UIActivityIndicatorView!
    
    @IBOutlet weak var webView: WKWebView!
    
    override func loadView() {
        super.loadView()
    }
    
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        let myURL = URL(string: "http://whiteboard.hopto.org:3000/")
        let myRequest = URLRequest(url: myURL!)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.allowsBackForwardNavigationGestures = true
//        webView.scrollView.bounces = false
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.load(myRequest)
        
        self.activityView.startAnimating()
        self.activityView.hidesWhenStopped = true
        
    }
    
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        activityView.stopAnimating()
        print("finished .......")
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        activityView.stopAnimating()
    }
    
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        print("loading .......")
        self.activityView.startAnimating()
    }
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }
    
}

