# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: raffle.proto
# Protobuf Python Version: 5.27.2
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import runtime_version as _runtime_version
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
_runtime_version.ValidateProtobufRuntimeVersion(
    _runtime_version.Domain.PUBLIC,
    5,
    27,
    2,
    '',
    'raffle.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x0craffle.proto\x12\x06raffle\"9\n\x16IncreaseBalanceRequest\x12\x0f\n\x07user_id\x18\x01 \x01(\t\x12\x0e\n\x06\x61mount\x18\x02 \x01(\x05\"*\n\x17IncreaseBalanceResponse\x12\x0f\n\x07\x62\x61lance\x18\x01 \x01(\x05\"?\n\x16PurchaseTicketsRequest\x12\x0f\n\x07user_id\x18\x01 \x01(\t\x12\x14\n\x0cticket_count\x18\x02 \x01(\x05\"D\n\x17PurchaseTicketsResponse\x12\x16\n\x0eticket_numbers\x18\x01 \x03(\t\x12\x11\n\traffle_id\x18\x02 \x01(\t\"2\n\x17GetCurrentRaffleRequest\x12\x17\n\x0fuser_auth_token\x18\x01 \x01(\t\"l\n\x18GetCurrentRaffleResponse\x12\x11\n\traffle_id\x18\x01 \x01(\t\x12\x10\n\x08\x65nd_time\x18\x02 \x01(\x03\x12\x14\n\x0c\x63urrent_pool\x18\x03 \x01(\x01\x12\x15\n\rparticipating\x18\x04 \x01(\x08\"\x19\n\x17GetRaffleResultsRequest\";\n\x06Winner\x12\x0f\n\x07user_id\x18\x01 \x01(\t\x12\x0e\n\x06\x61mount\x18\x02 \x01(\x01\x12\x10\n\x08position\x18\x03 \x01(\x05\"\x88\x01\n\x18GetRaffleResultsResponse\x12\x11\n\traffle_id\x18\x01 \x01(\t\x12\x12\n\nstart_time\x18\x02 \x01(\x03\x12\x10\n\x08\x65nd_time\x18\x03 \x01(\x03\x12\x12\n\ntotal_pool\x18\x04 \x01(\x01\x12\x1f\n\x07winners\x18\x05 \x03(\x0b\x32\x0e.raffle.Winner2\xe5\x02\n\rRaffleService\x12R\n\x0fPurchaseTickets\x12\x1e.raffle.PurchaseTicketsRequest\x1a\x1f.raffle.PurchaseTicketsResponse\x12U\n\x10GetCurrentRaffle\x12\x1f.raffle.GetCurrentRaffleRequest\x1a .raffle.GetCurrentRaffleResponse\x12R\n\x0fIncreaseBalance\x12\x1e.raffle.IncreaseBalanceRequest\x1a\x1f.raffle.IncreaseBalanceResponse\x12U\n\x10GetRaffleResults\x12\x1f.raffle.GetRaffleResultsRequest\x1a .raffle.GetRaffleResultsResponseb\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'raffle_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_INCREASEBALANCEREQUEST']._serialized_start=24
  _globals['_INCREASEBALANCEREQUEST']._serialized_end=81
  _globals['_INCREASEBALANCERESPONSE']._serialized_start=83
  _globals['_INCREASEBALANCERESPONSE']._serialized_end=125
  _globals['_PURCHASETICKETSREQUEST']._serialized_start=127
  _globals['_PURCHASETICKETSREQUEST']._serialized_end=190
  _globals['_PURCHASETICKETSRESPONSE']._serialized_start=192
  _globals['_PURCHASETICKETSRESPONSE']._serialized_end=260
  _globals['_GETCURRENTRAFFLEREQUEST']._serialized_start=262
  _globals['_GETCURRENTRAFFLEREQUEST']._serialized_end=312
  _globals['_GETCURRENTRAFFLERESPONSE']._serialized_start=314
  _globals['_GETCURRENTRAFFLERESPONSE']._serialized_end=422
  _globals['_GETRAFFLERESULTSREQUEST']._serialized_start=424
  _globals['_GETRAFFLERESULTSREQUEST']._serialized_end=449
  _globals['_WINNER']._serialized_start=451
  _globals['_WINNER']._serialized_end=510
  _globals['_GETRAFFLERESULTSRESPONSE']._serialized_start=513
  _globals['_GETRAFFLERESULTSRESPONSE']._serialized_end=649
  _globals['_RAFFLESERVICE']._serialized_start=652
  _globals['_RAFFLESERVICE']._serialized_end=1009
# @@protoc_insertion_point(module_scope)
