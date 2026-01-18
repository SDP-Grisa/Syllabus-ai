def is_valid_answer(results, threshold):
    avg_score = sum(score for _, score in results) / len(results)
    return avg_score >= threshold, avg_score
