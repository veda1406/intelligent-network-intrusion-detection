import requests

def main():
    base = 'http://127.0.0.1:8000'
    print("=== Intelligent NIDS Presentation Verification ===\n")
    
    # 1. Health Check
    health = requests.get(f'{base}/health').json()
    print(f"Health Status: {health['status']} | Model Loaded: {health['model_loaded']}")
    
    # 2. Model Comparison
    comp = requests.get(f'{base}/api/model-comparison').json()
    print(f"Dataset: {comp['dataset']} | Test Samples: {comp['total_test_samples']}")
    print(f"Winner: {comp['winner']['name']} (Acc: {comp['winner']['accuracy']*100:.1f}%, F1: {comp['winner']['f1_score']*100:.1f}%)")
    print(f"DNN: {comp['dnn_summary']['name']} (Acc: {comp['dnn_summary']['accuracy']*100:.1f}%, F1: {comp['dnn_summary']['f1_score']*100:.1f}%)\n")
    
    # 3. Test All 5 Samples
    samples = requests.get(f'{base}/api/sample-flows').json()
    print("Testing All 5 Representative Flow Samples:\n")
    all_passed = True
    
    for s in samples:
        cat = s['category']
        gt = s['ground_truth']
        
        # Operational prediction
        pred_res = requests.post(f'{base}/predict', json={'features': s['features'], 'ground_truth': gt}).json()
        op_pred = pred_res['prediction']
        op_conf = f"{pred_res['confidence']*100:.1f}%"
        op_correct = pred_res['is_correct']
        
        # DNN prediction from dual result
        dnn_pred = pred_res.get('dnn_prediction')
        dnn_conf = f"{pred_res.get('dnn_confidence', 0)*100:.1f}%"
        dnn_correct = pred_res.get('dnn_is_correct')
        
        # Threat severity & SHAP
        sev = pred_res['threat_severity']
        shap_feats = pred_res.get('top_shap_features') or {}
        
        # Dedicated DNN endpoint
        dnn_direct = requests.post(f'{base}/api/dnn-predict', json={'features': s['features'], 'ground_truth': gt}).json()
        
        status_symbol = "[PASS]" if (op_correct and dnn_correct) else "[FAIL]"
        if not (op_correct and dnn_correct):
            all_passed = False
            
        print(f"[{cat:8s}] GT: {gt:8s} | OP: {op_pred:8s} ({op_conf:6s}) | DNN: {dnn_pred:8s} ({dnn_conf:6s}) | Sev: {sev:8s} | SHAP: {len(shap_feats)} | {status_symbol}")
    
    print(f"\nFinal Result: {'ALL SAMPLES VERIFIED CORRECTLY' if all_passed else 'SOME SAMPLES MISMATCHED'}")

if __name__ == '__main__':
    main()
