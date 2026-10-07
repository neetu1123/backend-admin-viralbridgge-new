"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowLimited = exports.ALLOW_LIMITED_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ALLOW_LIMITED_KEY = 'allowLimited';
const AllowLimited = () => (0, common_1.SetMetadata)(exports.ALLOW_LIMITED_KEY, true);
exports.AllowLimited = AllowLimited;
//# sourceMappingURL=allow-limited.decorator.js.map