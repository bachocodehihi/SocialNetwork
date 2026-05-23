import 'package:socialnetwork/domain/repositories/call_repository.dart';

class CallUsecase {
  final CallRepository _repo;
  CallUsecase(this._repo);
  Future<Map<String, dynamic>> getMissedCallCount({DateTime? since}) => 
      _repo.getMissedCallCount(since: since);
      
  Future<Map<String, dynamic>> markMissedCallsRead() => 
      _repo.markMissedCallsRead();
      
  Future<Map<String, dynamic>> getCallHistory({
    int page = 1,
    int limit = 20,
    String? type,
    String? status,
    bool onlyMissed = false,
  }) => _repo.getCallHistory(
        page: page,
        limit: limit,
        type: type,
        status: status,
        onlyMissed: onlyMissed,
      );
}