# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: auth.proto
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
    'auth.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()


from .user_pb2 import *


DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\nauth.proto\x12\x04\x61uth\x1a\nuser.proto\"p\n\x13\x41uthTelegramRequest\x12\x13\n\x0btelegram_id\x18\x01 \x01(\t\x12\x18\n\x0breferred_by\x18\x02 \x01(\tH\x00\x88\x01\x01\x12\x1a\n\x12telegram_auth_code\x18\x03 \x01(\tB\x0e\n\x0c_referred_by\"F\n\x14\x41uthTelegramResponse\x12\r\n\x05token\x18\x01 \x01(\t\x12\x1f\n\x04user\x18\x02 \x01(\x0b\x32\x11.user.UserProfile\"E\n\x16UpdateTonWalletRequest\x12\x13\n\x0btelegram_id\x18\x01 \x01(\t\x12\x16\n\x0eton_public_key\x18\x02 \x01(\t\":\n\x17UpdateTonWalletResponse\x12\x1f\n\x04user\x18\x01 \x01(\x0b\x32\x11.user.UserProfile\"%\n\x14ValidateTokenRequest\x12\r\n\x05token\x18\x01 \x01(\t\"i\n\x15ValidateTokenResponse\x12\x10\n\x08is_valid\x18\x01 \x01(\x08\x12\x1f\n\x04user\x18\x02 \x01(\x0b\x32\x11.user.UserProfile\x12\x1d\n\x07tickets\x18\x03 \x03(\x0b\x32\x0c.user.Ticket2\xf6\x01\n\x0b\x41uthService\x12M\n\x14\x41uthenticateTelegram\x12\x19.auth.AuthTelegramRequest\x1a\x1a.auth.AuthTelegramResponse\x12N\n\x0fUpdateTonWallet\x12\x1c.auth.UpdateTonWalletRequest\x1a\x1d.auth.UpdateTonWalletResponse\x12H\n\rValidateToken\x12\x1a.auth.ValidateTokenRequest\x1a\x1b.auth.ValidateTokenResponseb\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'auth_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_AUTHTELEGRAMREQUEST']._serialized_start=32
  _globals['_AUTHTELEGRAMREQUEST']._serialized_end=144
  _globals['_AUTHTELEGRAMRESPONSE']._serialized_start=146
  _globals['_AUTHTELEGRAMRESPONSE']._serialized_end=216
  _globals['_UPDATETONWALLETREQUEST']._serialized_start=218
  _globals['_UPDATETONWALLETREQUEST']._serialized_end=287
  _globals['_UPDATETONWALLETRESPONSE']._serialized_start=289
  _globals['_UPDATETONWALLETRESPONSE']._serialized_end=347
  _globals['_VALIDATETOKENREQUEST']._serialized_start=349
  _globals['_VALIDATETOKENREQUEST']._serialized_end=386
  _globals['_VALIDATETOKENRESPONSE']._serialized_start=388
  _globals['_VALIDATETOKENRESPONSE']._serialized_end=493
  _globals['_AUTHSERVICE']._serialized_start=496
  _globals['_AUTHSERVICE']._serialized_end=742
# @@protoc_insertion_point(module_scope)
