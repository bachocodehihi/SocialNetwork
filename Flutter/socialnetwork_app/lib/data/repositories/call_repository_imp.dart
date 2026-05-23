import 'package:socialnetwork/data/network/api/call_api.dart';
import 'package:socialnetwork/domain/repositories/call_repository.dart';
class CallRepositoryImp implements CallRepository {
  final CallApi _api;

  CallRepositoryImp(this._api);
  @override
  Future<Map<String, dynamic>> getMissedCallCount({DateTime? since}) => 
      _api.getMissedCallCount(since: since);

  @override
  Future<Map<String, dynamic>> markMissedCallsRead() => 
      _api.markMissedCallsRead();

  @override
  Future<Map<String, dynamic>> getCallHistory({
    int page = 1,
    int limit = 20,
    String? type,
    String? status,
    bool onlyMissed = false,
  }) => _api.getCallHistory(
        page: page,
        limit: limit,
        type: type,
        status: status,
        onlyMissed: onlyMissed,
      );
}