abstract class CallRepository {
  Future<Map<String, dynamic>> getMissedCallCount({DateTime? since});
  Future<Map<String, dynamic>> markMissedCallsRead();
  Future<Map<String, dynamic>> getCallHistory({
    int page,
    int limit,
    String? type,
    String? status,
    bool onlyMissed,
  });
}