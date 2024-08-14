/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (g && (g = 0, op[0] && (_ = 0)), _) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MAGNETO_APP = void 0;
	var entcore_1 = __webpack_require__(1);
	var magnetoBehaviours_1 = __webpack_require__(370);
	var services_1 = __webpack_require__(375);
	exports.MAGNETO_APP = "magneto";
	entcore_1.Behaviours.register(exports.MAGNETO_APP, {
	    rights: magnetoBehaviours_1.rights,
	    dependencies: {},
	    loadResources: function () {
	        return __awaiter(this, void 0, void 0, function () {
	            var data;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0: return [4 /*yield*/, services_1.boardsService.getAllBoardsEditable()];
	                    case 1:
	                        data = _a.sent();
	                        this.resources = data.all.map(function (board) {
	                            return {
	                                id: board.id,
	                                icon: board.imageUrl,
	                                title: board.title,
	                                ownerName: board.owner.displayName,
	                                path: "/magneto#/board/view/".concat(board.id)
	                            };
	                        });
	                        return [2 /*return*/];
	                }
	            });
	        });
	    },
	    resource: function (resource) {
	        var rightsContainer = resource;
	        if (resource && !resource.myRights) {
	            resource.myRights = {};
	        }
	        for (var behaviour in magnetoBehaviours_1.rights.resources) {
	            if (entcore_1.model.me.hasRight(rightsContainer, magnetoBehaviours_1.rights.resources[behaviour]) ||
	                entcore_1.model.me.userId === resource.owner.userId || entcore_1.model.me.userId === rightsContainer.owner.userId) {
	                if (resource.myRights[behaviour] !== undefined) {
	                    resource.myRights[behaviour] = resource.myRights[behaviour] &&
	                        magnetoBehaviours_1.rights.resources[behaviour];
	                }
	                else {
	                    resource.myRights[behaviour] = magnetoBehaviours_1.rights.resources[behaviour];
	                }
	            }
	        }
	        return resource;
	    },
	    resourceRights: function () {
	        return ['read', 'publish', 'contrib', 'manager'];
	    }
	});


/***/ }),

/***/ 1:
/***/ (function(module, exports) {

	module.exports = entcore;

/***/ }),

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (this && this.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(__webpack_require__(6), exports);
	__exportStar(__webpack_require__(9), exports);
	__exportStar(__webpack_require__(10), exports);
	__exportStar(__webpack_require__(14), exports);
	__exportStar(__webpack_require__(15), exports);
	__exportStar(__webpack_require__(16), exports);


/***/ }),

/***/ 6:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
	    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
	        if (ar || !(i in from)) {
	            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	            ar[i] = from[i];
	        }
	    }
	    return to.concat(ar || Array.prototype.slice.call(from));
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Boards = exports.Board = exports.BoardForm = void 0;
	var folder_type_enum_1 = __webpack_require__(7);
	var entcore_1 = __webpack_require__(1);
	var layout_type_enum_1 = __webpack_require__(8);
	var BoardForm = /** @class */ (function () {
	    function BoardForm() {
	        this._id = null;
	        this._title = null;
	        this._description = null;
	        this._imageUrl = null;
	        this._backgroundUrl = null;
	        this._folderId = null;
	        this._cardIds = null;
	        this._sectionIds = null;
	        this._public = false;
	        this._tags = null;
	        this._layoutType = layout_type_enum_1.LAYOUT_TYPE.FREE;
	        this._tagsTextInput = null;
	        this._canComment = false;
	        this._displayNbFavorites = false;
	    }
	    BoardForm.prototype.build = function (board) {
	        this.id = board.id;
	        this.title = board.title;
	        this.description = board.description;
	        this.imageUrl = board.imageUrl;
	        this.backgroundUrl = board.backgroundUrl;
	        this.folderId = board.folderId;
	        this.tags = board.tags;
	        this.tagsTextInput = board.tagsTextInput;
	        this.public = board.public;
	        this.layoutType = board.layoutType;
	        this.canComment = board.canComment;
	        this.displayNbFavorites = board.displayNbFavorites;
	        return this;
	    };
	    Object.defineProperty(BoardForm.prototype, "id", {
	        get: function () {
	            return this._id;
	        },
	        set: function (value) {
	            this._id = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "title", {
	        get: function () {
	            return this._title;
	        },
	        set: function (value) {
	            this._title = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "description", {
	        get: function () {
	            return this._description;
	        },
	        set: function (value) {
	            this._description = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "imageUrl", {
	        get: function () {
	            return this._imageUrl;
	        },
	        set: function (value) {
	            this._imageUrl = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "backgroundUrl", {
	        get: function () {
	            return this._backgroundUrl;
	        },
	        set: function (value) {
	            this._backgroundUrl = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "folderId", {
	        get: function () {
	            return this._folderId;
	        },
	        set: function (value) {
	            this._folderId = (value === folder_type_enum_1.FOLDER_TYPE.MY_BOARDS
	                || value === folder_type_enum_1.FOLDER_TYPE.DELETED_BOARDS) ? null : value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "cardIds", {
	        get: function () {
	            return this._cardIds;
	        },
	        set: function (value) {
	            this._cardIds = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "sectionsIds", {
	        get: function () {
	            return this._sectionIds;
	        },
	        set: function (value) {
	            this._sectionIds = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "tags", {
	        get: function () {
	            return this._tags;
	        },
	        set: function (value) {
	            this._tags = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "layoutType", {
	        get: function () {
	            return this._layoutType;
	        },
	        set: function (value) {
	            this._layoutType = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "tagsTextInput", {
	        get: function () {
	            return this._tagsTextInput;
	        },
	        set: function (value) {
	            this._tagsTextInput = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "public", {
	        get: function () {
	            return this._public;
	        },
	        set: function (value) {
	            this._public = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "canComment", {
	        get: function () {
	            return this._canComment;
	        },
	        set: function (value) {
	            this._canComment = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(BoardForm.prototype, "displayNbFavorites", {
	        get: function () {
	            return this._displayNbFavorites;
	        },
	        set: function (value) {
	            this._displayNbFavorites = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    BoardForm.prototype.isLayoutFree = function () {
	        return this.layoutType == layout_type_enum_1.LAYOUT_TYPE.FREE;
	    };
	    BoardForm.prototype.isValid = function () {
	        return this.title !== null && this.title !== '' &&
	            this.imageUrl != null && this.imageUrl !== '' && this.layoutType !== null;
	    };
	    BoardForm.prototype.toJSON = function () {
	        var payload = {};
	        if (this.title) {
	            payload.title = this.title;
	        }
	        if (this.description != null) {
	            payload.description = this.description;
	        }
	        if (this.imageUrl) {
	            payload.imageUrl = this.imageUrl;
	        }
	        if (this.backgroundUrl != null) {
	            payload.backgroundUrl = this.backgroundUrl;
	        }
	        if (this.folderId) {
	            payload.folderId = this.folderId;
	        }
	        if (this.cardIds) {
	            payload.cardIds = this.cardIds;
	        }
	        if (this.sectionsIds) {
	            payload.sectionIds = this.sectionsIds;
	        }
	        if (this.tags) {
	            payload.tags = this.tags;
	        }
	        if (this.layoutType) {
	            payload.layoutType = this.layoutType;
	        }
	        if (this.public) {
	            payload.public = this.public;
	        }
	        if (this.canComment != null) {
	            payload.canComment = this.canComment;
	        }
	        if (this.id && this.id != '') {
	            payload.id = this.id;
	        }
	        if (this.displayNbFavorites != null) {
	            payload.displayNbFavorites = this.displayNbFavorites;
	        }
	        return payload;
	    };
	    return BoardForm;
	}());
	exports.BoardForm = BoardForm;
	var Board = /** @class */ (function () {
	    function Board() {
	        this._title = " ";
	    }
	    Board.prototype.build = function (data) {
	        this._id = data._id;
	        this._title = data.title;
	        this._imageUrl = data.imageUrl;
	        this._backgroundUrl = data.backgroundUrl;
	        this._description = data.description;
	        this._cardIds = data.cardIds;
	        this._sections = data.sections;
	        this._layoutType = data.layoutType;
	        this._tags = data.tags;
	        this._tagsTextInput = data.tags ? data.tags
	            .map(function (tag) { return '#' + tag; })
	            .toString()
	            .replace(/,/g, ' ') : '';
	        this._nbCards = data.nbCards;
	        this._nbCardsSections = data.nbCardsSections;
	        this._modificationDate = data.modificationDate;
	        this._creationDate = data.creationDate;
	        this._folderId = data.folderId;
	        this._public = data.public;
	        this.owner = { userId: data.ownerId, displayName: data.ownerName };
	        this.shared = data.shared;
	        this._deleted = data.deleted;
	        this._canComment = data.canComment;
	        this._displayNbFavorites = data.displayNbFavorites;
	        return this;
	    };
	    Object.defineProperty(Board.prototype, "id", {
	        get: function () {
	            return this._id;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "title", {
	        get: function () {
	            return this._title;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "description", {
	        get: function () {
	            return this._description;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "imageUrl", {
	        get: function () {
	            return this._imageUrl;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "backgroundUrl", {
	        get: function () {
	            return this._backgroundUrl;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "cardIds", {
	        get: function () {
	            return this._cardIds;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "sections", {
	        get: function () {
	            return this._sections;
	        },
	        set: function (value) {
	            this._sections = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "sectionsIds", {
	        get: function () {
	            return this._sections.map(function (section) { return section.id; });
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "nbCards", {
	        get: function () {
	            return this._nbCards;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "nbCardsSections", {
	        get: function () {
	            return this._nbCardsSections;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "modificationDate", {
	        get: function () {
	            return this._modificationDate;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "creationDate", {
	        get: function () {
	            return this._creationDate;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "folderId", {
	        get: function () {
	            return this._folderId;
	        },
	        set: function (value) {
	            this._folderId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "public", {
	        get: function () {
	            return this._public;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "deleted", {
	        get: function () {
	            return this._deleted;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "layoutType", {
	        get: function () {
	            return this._layoutType;
	        },
	        set: function (value) {
	            this._layoutType = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "tags", {
	        get: function () {
	            return this._tags;
	        },
	        set: function (value) {
	            this._tags = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "tagsTextInput", {
	        get: function () {
	            return this._tagsTextInput;
	        },
	        set: function (value) {
	            this._tagsTextInput = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Board.prototype.hasCardsSection = function () {
	        return !!this._sections ? this._sections.some(function (section) { return section.cards.length > 0; }) : false;
	    };
	    Board.prototype.cardIdsSection = function () {
	        return !!this._sections ? this._sections.reduce(function (acc, section) { return __spreadArray(__spreadArray([], acc, true), section.cardIds, true); }, []) : [];
	    };
	    Board.prototype.sortSections = function (value) {
	        return this._sections.sort(function (a, b) { return value.indexOf(a.id) - value.indexOf(b.id); });
	    };
	    Board.prototype.isMyBoard = function () {
	        return this.owner.userId === entcore_1.model.me.userId;
	    };
	    Board.prototype.isLayoutFree = function () {
	        return this.layoutType == layout_type_enum_1.LAYOUT_TYPE.FREE;
	    };
	    Board.prototype.isLayoutHorizontal = function () {
	        return this.layoutType == layout_type_enum_1.LAYOUT_TYPE.HORIZONTAL;
	    };
	    Board.prototype.isLayoutVertical = function () {
	        return this.layoutType == layout_type_enum_1.LAYOUT_TYPE.VERTICAL;
	    };
	    Object.defineProperty(Board.prototype, "canComment", {
	        get: function () {
	            return this._canComment;
	        },
	        set: function (value) {
	            this._canComment = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Board.prototype, "displayNbFavorites", {
	        get: function () {
	            return this._displayNbFavorites;
	        },
	        set: function (value) {
	            this._displayNbFavorites = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return Board;
	}());
	exports.Board = Board;
	var Boards = /** @class */ (function () {
	    function Boards(data) {
	        this.all = data.all.map(function (board) {
	            return entcore_1.Behaviours.applicationsBehaviours.magneto.resource(new Board().build(board));
	        });
	        this.page = data.page;
	        this.pageCount = data.pageCount;
	    }
	    return Boards;
	}());
	exports.Boards = Boards;


/***/ }),

/***/ 7:
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MAIN_PAGE_TITLE = exports.FOLDER_TYPE = void 0;
	var FOLDER_TYPE;
	(function (FOLDER_TYPE) {
	    FOLDER_TYPE["MY_BOARDS"] = "my-boards";
	    FOLDER_TYPE["PUBLIC_BOARDS"] = "public-boards";
	    FOLDER_TYPE["DELETED_BOARDS"] = "deleted-boards";
	})(FOLDER_TYPE = exports.FOLDER_TYPE || (exports.FOLDER_TYPE = {}));
	exports.MAIN_PAGE_TITLE = 'Mes tableaux';


/***/ }),

/***/ 8:
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.LAYOUT_TYPE = void 0;
	var LAYOUT_TYPE;
	(function (LAYOUT_TYPE) {
	    LAYOUT_TYPE["FREE"] = "free";
	    LAYOUT_TYPE["VERTICAL"] = "vertical";
	    LAYOUT_TYPE["HORIZONTAL"] = "horizontal";
	})(LAYOUT_TYPE = exports.LAYOUT_TYPE || (exports.LAYOUT_TYPE = {}));


/***/ }),

/***/ 9:
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Sections = exports.Section = exports.SectionForm = void 0;
	var SectionForm = /** @class */ (function () {
	    function SectionForm() {
	        this._id = null;
	        this._title = null;
	        this._cardIds = null;
	        this._boardId = null;
	    }
	    SectionForm.prototype.build = function (section) {
	        this.id = section.id;
	        this.title = section.title;
	        this.cardIds = section.cardIds;
	        this.boardId = section.boardId;
	        if (section.displayed !== undefined)
	            this.displayed = section.displayed;
	        return this;
	    };
	    SectionForm.prototype.buildNew = function (boardId) {
	        this.title = "";
	        this.cardIds = [];
	        this.boardId = boardId;
	        return this;
	    };
	    Object.defineProperty(SectionForm.prototype, "id", {
	        get: function () {
	            return this._id;
	        },
	        set: function (value) {
	            this._id = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(SectionForm.prototype, "title", {
	        get: function () {
	            return this._title;
	        },
	        set: function (value) {
	            this._title = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(SectionForm.prototype, "boardId", {
	        get: function () {
	            return this._boardId;
	        },
	        set: function (value) {
	            this._boardId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(SectionForm.prototype, "cardIds", {
	        get: function () {
	            return this._cardIds;
	        },
	        set: function (value) {
	            this._cardIds = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    SectionForm.prototype.addCardId = function (value) {
	        this._cardIds.push(value);
	    };
	    Object.defineProperty(SectionForm.prototype, "displayed", {
	        get: function () {
	            return this._displayed;
	        },
	        set: function (value) {
	            this._displayed = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    SectionForm.prototype.isValid = function () {
	        return this.title !== null && this.title !== '';
	    };
	    SectionForm.prototype.toJSON = function () {
	        var payload = {};
	        if (this.title) {
	            payload.title = this.title;
	        }
	        if (this.boardId) {
	            payload.boardId = this.boardId;
	        }
	        if (this.id && this.id != '') {
	            payload.id = this.id;
	        }
	        payload.cardIds = this.cardIds;
	        if (this.displayed !== undefined && this.displayed !== null) {
	            payload.displayed = this.displayed;
	        }
	        return payload;
	    };
	    return SectionForm;
	}());
	exports.SectionForm = SectionForm;
	var Section = /** @class */ (function () {
	    function Section() {
	    }
	    Section.prototype.build = function (data) {
	        this._id = data._id;
	        this._title = data.title;
	        this._boardId = data.boardId;
	        this._cardIds = data.cardIds;
	        this._cards = [];
	        this._page = 0;
	        this._displayed = data.displayed !== false;
	        return this;
	    };
	    Object.defineProperty(Section.prototype, "id", {
	        get: function () {
	            return this._id;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Section.prototype, "title", {
	        get: function () {
	            return this._title;
	        },
	        set: function (value) {
	            this._title = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Section.prototype, "boardId", {
	        get: function () {
	            return this._boardId;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Section.prototype, "cardIds", {
	        get: function () {
	            return this._cardIds;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Section.prototype, "page", {
	        get: function () {
	            return this._page;
	        },
	        set: function (value) {
	            this._page = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Section.prototype, "cards", {
	        get: function () {
	            return this._cards;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Section.prototype, "displayed", {
	        get: function () {
	            return this._displayed;
	        },
	        set: function (value) {
	            this._displayed = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return Section;
	}());
	exports.Section = Section;
	var Sections = /** @class */ (function () {
	    function Sections(data) {
	        this.all = data.all.map(function (section) { return new Section().build(section); });
	    }
	    return Sections;
	}());
	exports.Sections = Sections;


/***/ }),

/***/ 10:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CardCollection = exports.Cards = exports.Card = exports.CardForm = void 0;
	var resource_type_enum_1 = __webpack_require__(11);
	var card_comment_model_1 = __webpack_require__(12);
	var FileViewerModel_1 = __webpack_require__(13);
	var CardForm = /** @class */ (function () {
	    function CardForm() {
	        this._id = '';
	        this._title = '';
	        this._description = '';
	        this._caption = '';
	        this._resourceId = '';
	        this._resourceUrl = '';
	        this._resourceFileName = '';
	        this._resourceType = '';
	        this._boardId = '';
	        this._locked = false;
	        this._sectionId = null;
	    }
	    CardForm.prototype.build = function (card) {
	        this._id = card.id;
	        this._title = card.title;
	        this._description = card.description;
	        this._caption = card.caption;
	        this._resourceId = card.resourceId;
	        this._resourceUrl = card.resourceUrl;
	        this._resourceType = card.resourceType;
	        this.resource = card.resource;
	        this._boardId = card.boardId;
	        this._locked = card.locked;
	        this._sectionId = null;
	        return this;
	    };
	    Object.defineProperty(CardForm.prototype, "id", {
	        get: function () {
	            return this._id;
	        },
	        set: function (value) {
	            this._id = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardForm.prototype, "title", {
	        get: function () {
	            return this._title;
	        },
	        set: function (value) {
	            this._title = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardForm.prototype, "description", {
	        get: function () {
	            return this._description;
	        },
	        set: function (value) {
	            this._description = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardForm.prototype, "resourceId", {
	        get: function () {
	            return this._resourceId;
	        },
	        set: function (value) {
	            if (this.resourceType === resource_type_enum_1.RESOURCE_TYPE.IMAGE) {
	                this._resourceUrl = '/workspace/document/' + value;
	            }
	            this._resourceId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardForm.prototype, "resourceUrl", {
	        get: function () {
	            return this._resourceUrl;
	        },
	        set: function (value) {
	            this._resourceUrl = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardForm.prototype, "caption", {
	        get: function () {
	            return this._caption;
	        },
	        set: function (value) {
	            this._caption = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardForm.prototype, "resourceType", {
	        get: function () {
	            return this._resourceType;
	        },
	        set: function (value) {
	            this._resourceType = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardForm.prototype, "boardId", {
	        get: function () {
	            return this._boardId;
	        },
	        set: function (value) {
	            this._boardId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardForm.prototype, "locked", {
	        get: function () {
	            return this._locked;
	        },
	        set: function (value) {
	            this._locked = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardForm.prototype, "sectionId", {
	        get: function () {
	            return this._sectionId;
	        },
	        set: function (value) {
	            this._sectionId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardForm.prototype, "resourceFileName", {
	        get: function () {
	            return this._resourceFileName;
	        },
	        set: function (value) {
	            this._resourceFileName = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardForm.prototype, "resource", {
	        get: function () {
	            return this._resource;
	        },
	        set: function (value) {
	            this._resource = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    CardForm.prototype.isValid = function () {
	        return this.resourceType != null && this.resourceType !== '';
	    };
	    CardForm.prototype.toJSON = function () {
	        var payload = {
	            title: this.title,
	            description: this.description,
	            caption: this.caption,
	            locked: this.locked,
	            resourceId: this.resourceId,
	            resourceType: this.resourceType,
	            resourceUrl: this.resourceUrl,
	            boardId: this.boardId
	        };
	        if (this.sectionId && this.sectionId != '')
	            payload.sectionId = this.sectionId;
	        if (this.id && this.id != '')
	            payload.id = this.id;
	        return payload;
	    };
	    return CardForm;
	}());
	exports.CardForm = CardForm;
	var Card = /** @class */ (function () {
	    function Card() {
	        var _this = this;
	        this.isType = function (resourceType) {
	            return _this.resourceType == resourceType;
	        };
	        this.isCompressed = function () {
	            return _this.metadata && _this.metadata["content-type"] && (_this.metadata["content-type"].includes("zip") ||
	                _this.metadata["content-type"].includes("octet-stream"));
	        };
	    }
	    Card.prototype.build = function (data) {
	        this._id = data._id ? data._id : data.id;
	        this._title = data.title;
	        this._resourceId = data.resourceId;
	        this._resourceType = data.resourceType;
	        this._resourceUrl = data.resourceUrl;
	        this._description = data.description;
	        this._caption = data.caption;
	        this._locked = data.locked;
	        this._modificationDate = data.modificationDate;
	        this._creationDate = data.creationDate;
	        this._ownerId = data.ownerId;
	        this._ownerName = data.ownerName;
	        this._lastModifierId = data.lastModifierId;
	        this._lastModifierName = data.lastModifierName;
	        this._boardId = data.boardId;
	        this._boardTitle = data.boardTitle;
	        this._parentId = data.parentId;
	        this._metadata = data.metadata;
	        this._nbOfComments = data.nbOfComments;
	        this._lastComment = (data.nbOfComments != null && data.nbOfComments > 0) ?
	            new card_comment_model_1.CardComment().build(data.lastComment) : null;
	        this._nbOfFavorites = data.nbOfFavorites;
	        this._liked = data.liked;
	        if (this._resourceType === "file")
	            this._resource = this.initResource();
	        return this;
	    };
	    Card.prototype.initResource = function () {
	        this._resource = new FileViewerModel_1.FileViewModel();
	        this._resource._id = this._resourceId;
	        this._resource.metadata = this.metadata;
	        if (!this._resource.metadata["content-type"])
	            this._resource.metadata["content-type"] = this.metadata.contentType;
	        this._resource.name = this.title;
	        this._resource.ownerName = this.ownerName;
	        this._resource.link = "/workspace/document/".concat(this.resourceId);
	        return this._resource;
	    };
	    Object.defineProperty(Card.prototype, "id", {
	        get: function () {
	            return this._id;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "title", {
	        get: function () {
	            return this._title;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "description", {
	        get: function () {
	            return this._description;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "caption", {
	        get: function () {
	            return this._caption;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "locked", {
	        get: function () {
	            return this._locked;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "resourceId", {
	        get: function () {
	            return this._resourceId;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "resourceType", {
	        get: function () {
	            return this._resourceType;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "creationDate", {
	        get: function () {
	            return this._creationDate;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "modificationDate", {
	        get: function () {
	            return this._modificationDate;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "ownerName", {
	        get: function () {
	            return this._ownerName;
	        },
	        set: function (value) {
	            this._ownerName = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "ownerId", {
	        get: function () {
	            return this._ownerId;
	        },
	        set: function (value) {
	            this._ownerId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "parentId", {
	        get: function () {
	            return this._parentId;
	        },
	        set: function (value) {
	            this._parentId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "boardId", {
	        get: function () {
	            return this._boardId;
	        },
	        set: function (value) {
	            this._boardId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "boardTitle", {
	        get: function () {
	            return this._boardTitle;
	        },
	        set: function (value) {
	            this._boardTitle = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "lastModifierName", {
	        get: function () {
	            return this._lastModifierName;
	        },
	        set: function (value) {
	            this._lastModifierName = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "lastModifierId", {
	        get: function () {
	            return this._lastModifierId;
	        },
	        set: function (value) {
	            this._lastModifierId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "metadata", {
	        get: function () {
	            return this._metadata;
	        },
	        set: function (value) {
	            this._metadata = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "resourceUrl", {
	        get: function () {
	            return this._resourceUrl;
	        },
	        set: function (value) {
	            this._resourceUrl = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "nbOfComments", {
	        get: function () {
	            return this._nbOfComments;
	        },
	        set: function (value) {
	            this._nbOfComments = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "lastComment", {
	        get: function () {
	            return this._lastComment;
	        },
	        set: function (value) {
	            this._lastComment = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "nbOfFavorites", {
	        get: function () {
	            return this._nbOfFavorites;
	        },
	        set: function (value) {
	            this._nbOfFavorites = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "liked", {
	        get: function () {
	            return this._liked;
	        },
	        set: function (value) {
	            this._liked = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Card.prototype, "resource", {
	        get: function () {
	            return this._resource;
	        },
	        set: function (value) {
	            this._resource = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return Card;
	}());
	exports.Card = Card;
	var Cards = /** @class */ (function () {
	    function Cards(data) {
	        this.all = data.all.map(function (card) { return new Card().build(card); });
	        this.page = data.page;
	        this.pageCount = data.pageCount;
	    }
	    return Cards;
	}());
	exports.Cards = Cards;
	var CardCollection = /** @class */ (function () {
	    function CardCollection(boardId, cards) {
	        this.cards = cards;
	        this.boardId = boardId;
	        this.isLinkedCardsDisplay = false;
	    }
	    return CardCollection;
	}());
	exports.CardCollection = CardCollection;


/***/ }),

/***/ 11:
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.RESOURCE_TYPE = void 0;
	var RESOURCE_TYPE;
	(function (RESOURCE_TYPE) {
	    RESOURCE_TYPE["TEXT"] = "text";
	    RESOURCE_TYPE["IMAGE"] = "image";
	    RESOURCE_TYPE["VIDEO"] = "video";
	    RESOURCE_TYPE["AUDIO"] = "audio";
	    RESOURCE_TYPE["PDF"] = "pdf";
	    RESOURCE_TYPE["SHEET"] = "sheet";
	    RESOURCE_TYPE["FILE"] = "file";
	    RESOURCE_TYPE["LINK"] = "link";
	    RESOURCE_TYPE["CARD"] = "card";
	    RESOURCE_TYPE["DEFAULT"] = "default";
	})(RESOURCE_TYPE = exports.RESOURCE_TYPE || (exports.RESOURCE_TYPE = {}));


/***/ }),

/***/ 12:
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CardComments = exports.CardComment = void 0;
	var CardComment = /** @class */ (function () {
	    function CardComment() {
	    }
	    CardComment.prototype.build = function (data) {
	        if (data == null)
	            return;
	        this._id = data._id;
	        this._ownerId = data.ownerId;
	        this._ownerName = data.ownerName;
	        this._creationDate = data.creationDate;
	        this._modificationDate = data.modificationDate;
	        this._content = data.content;
	        return this;
	    };
	    Object.defineProperty(CardComment.prototype, "id", {
	        get: function () {
	            return this._id;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardComment.prototype, "ownerId", {
	        get: function () {
	            return this._ownerId;
	        },
	        set: function (value) {
	            this._ownerId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardComment.prototype, "creationDate", {
	        get: function () {
	            return this._creationDate;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardComment.prototype, "modificationDate", {
	        get: function () {
	            return this._modificationDate;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardComment.prototype, "content", {
	        get: function () {
	            return this._content;
	        },
	        set: function (value) {
	            this._content = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(CardComment.prototype, "ownerName", {
	        get: function () {
	            return this._ownerName;
	        },
	        set: function (value) {
	            this._ownerName = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return CardComment;
	}());
	exports.CardComment = CardComment;
	var CardComments = /** @class */ (function () {
	    function CardComments(data) {
	        this.all = data.all.map(function (cardComment) { return new CardComment().build(cardComment); });
	        this.count = data.count;
	    }
	    return CardComments;
	}());
	exports.CardComments = CardComments;


/***/ }),

/***/ 13:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FileViewModel = void 0;
	var entcore_1 = __webpack_require__(1);
	var FileViewModel = /** @class */ (function (_super) {
	    __extends(FileViewModel, _super);
	    function FileViewModel() {
	        return _super !== null && _super.apply(this, arguments) || this;
	    }
	    return FileViewModel;
	}(entcore_1.workspace.v2.models.Element));
	exports.FileViewModel = FileViewModel;


/***/ }),

/***/ 14:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.Folder = void 0;
	var entcore_1 = __webpack_require__(1);
	var Folder = /** @class */ (function () {
	    function Folder() {
	    }
	    Folder.prototype.build = function (data) {
	        this._id = data._id;
	        this._title = data.title;
	        this._parentId = data.parentId;
	        this._ownerId = data.ownerId;
	        this._shared = data.shared;
	        return this;
	    };
	    Object.defineProperty(Folder.prototype, "id", {
	        get: function () {
	            return this._id;
	        },
	        set: function (value) {
	            this._id = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Folder.prototype, "parentId", {
	        get: function () {
	            return this._parentId;
	        },
	        set: function (value) {
	            this._parentId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Folder.prototype, "title", {
	        get: function () {
	            return this._title;
	        },
	        set: function (value) {
	            this._title = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Folder.prototype, "ownerId", {
	        get: function () {
	            return this._ownerId;
	        },
	        set: function (value) {
	            this._ownerId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(Folder.prototype, "shared", {
	        get: function () {
	            return this._shared;
	        },
	        set: function (value) {
	            this._shared = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Folder.prototype.isMyFolder = function () {
	        return this.ownerId === entcore_1.model.me.userId;
	    };
	    Folder.prototype.navItemToFolder = function (navItem) {
	        var finalFolder = new Folder();
	        finalFolder.id = navItem.id;
	        finalFolder.title = navItem.name;
	        finalFolder.parentId = navItem.parentId;
	        finalFolder.ownerId = navItem.ownerId;
	        finalFolder.shared = navItem.shared;
	        return finalFolder;
	    };
	    return Folder;
	}());
	exports.Folder = Folder;


/***/ }),

/***/ 15:
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FolderTreeNavItem = void 0;
	var FolderTreeNavItem = /** @class */ (function () {
	    function FolderTreeNavItem(folder, isOpened, iconClass) {
	        this._id = folder.id;
	        this._name = folder.title;
	        this._parentId = folder.parentId;
	        this._children = [];
	        this._iconClass = iconClass;
	        this._isOpened = (isOpened !== null) ? isOpened : false;
	        this._ownerId = folder.ownerId ? folder.ownerId : "";
	        this._shared = folder.shared ? folder.shared : [];
	    }
	    Object.defineProperty(FolderTreeNavItem.prototype, "id", {
	        get: function () {
	            return this._id;
	        },
	        set: function (value) {
	            this._id = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(FolderTreeNavItem.prototype, "name", {
	        get: function () {
	            return this._name;
	        },
	        set: function (value) {
	            this._name = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(FolderTreeNavItem.prototype, "iconClass", {
	        get: function () {
	            return this._iconClass;
	        },
	        set: function (value) {
	            this._iconClass = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(FolderTreeNavItem.prototype, "children", {
	        get: function () {
	            return this._children;
	        },
	        set: function (value) {
	            this._children = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(FolderTreeNavItem.prototype, "parentId", {
	        get: function () {
	            return this._parentId;
	        },
	        set: function (value) {
	            this._parentId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(FolderTreeNavItem.prototype, "isOpened", {
	        get: function () {
	            return this._isOpened;
	        },
	        set: function (value) {
	            this._isOpened = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(FolderTreeNavItem.prototype, "ownerId", {
	        get: function () {
	            return this._ownerId;
	        },
	        set: function (value) {
	            this._ownerId = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    Object.defineProperty(FolderTreeNavItem.prototype, "shared", {
	        get: function () {
	            return this._shared;
	        },
	        set: function (value) {
	            this._shared = value;
	        },
	        enumerable: false,
	        configurable: true
	    });
	    /**
	     * Check if the folder has a children (or sub-children) with the given id
	     * @param folderId Folder identifier
	     */
	    FolderTreeNavItem.prototype.childrenContainsId = function (folderId) {
	        return this.id == folderId
	            || this.children.some(function (folder) { return folder.id === folderId
	                || folder.childrenContainsId(folderId); });
	    };
	    /**
	     * Open all folders from the given children folder to the current folder
	     * @param folderId Folder identifier
	     */
	    FolderTreeNavItem.prototype.openChildrenToId = function (folderId) {
	        if (this.childrenContainsId(folderId)) {
	            this._isOpened = true;
	            if (this.children) {
	                this.children.forEach(function (folder) {
	                    folder.openChildrenToId(folderId);
	                });
	            }
	        }
	    };
	    /**
	     * Populate/Update the children list from the given folder list
	     * @param folders Folder list
	     */
	    FolderTreeNavItem.prototype.buildFolders = function (folders) {
	        var _this = this;
	        var childrenFolders = folders.filter(function (folder) { return folder.parentId === _this._id; });
	        var newChildren = [];
	        childrenFolders.forEach(function (folder) {
	            var childMatch = _this.children.find(function (f) { return f.id === folder.id && f.name === folder.title; });
	            if (childMatch === undefined) {
	                newChildren.push(new FolderTreeNavItem(folder).buildFolders(folders));
	            }
	            else {
	                newChildren.push(childMatch.buildFolders(folders));
	            }
	        });
	        this.children = newChildren;
	        return this;
	    };
	    return FolderTreeNavItem;
	}());
	exports.FolderTreeNavItem = FolderTreeNavItem;


/***/ }),

/***/ 16:
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });


/***/ }),

/***/ 309:
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) { return [] }
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),

/***/ 370:
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.rights = void 0;
	exports.rights = {
	    resources: {
	        read: {
	            right: "fr-cgi-magneto-controller-ShareBoardController|initReadRight"
	        },
	        publish: {
	            right: "fr-cgi-magneto-controller-ShareBoardController|initPublishRight"
	        },
	        contrib: {
	            right: "fr-cgi-magneto-controller-ShareBoardController|initContribRight"
	        },
	        manager: {
	            right: "fr-cgi-magneto-controller-ShareBoardController|initManagerRight"
	        }
	    },
	    workflow: {
	        view: 'fr.cgi.magneto.controller.MagnetoController|view',
	        manage: 'fr.cgi.magneto.controller.FakeRight|boardManage',
	        publish: 'fr.cgi.magneto.controller.FakeRight|boardPublish',
	        comment: 'fr.cgi.magneto.controller.FakeRight|boardComment',
	        favorites: 'fr.cgi.magneto.controller.FakeRight|boardFavorites',
	    }
	};


/***/ }),

/***/ 375:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (this && this.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(__webpack_require__(376), exports);
	__exportStar(__webpack_require__(413), exports);
	__exportStar(__webpack_require__(414), exports);
	__exportStar(__webpack_require__(415), exports);
	__exportStar(__webpack_require__(416), exports);
	__exportStar(__webpack_require__(417), exports);


/***/ }),

/***/ 376:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (g && (g = 0, op[0] && (_ = 0)), _) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.BoardsService = exports.boardsService = void 0;
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(377);
	var models_1 = __webpack_require__(5);
	exports.boardsService = {
	    getAllBoards: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        var urlParams;
	        return __generator(this, function (_a) {
	            urlParams = "?isPublic=".concat(params.isPublic, "&isShared=").concat(params.isShared) +
	                "&isDeleted=".concat(params.isDeleted, "&sortBy=").concat(params.sortBy);
	            if (params.folderId) {
	                urlParams += "&folderId=".concat(params.folderId);
	            }
	            if (params.page != null) {
	                urlParams += "&page=".concat(params.page);
	            }
	            if (params.searchText !== undefined && params.searchText !== null && params.searchText !== '') {
	                urlParams += "&searchText=".concat(params.searchText);
	            }
	            return [2 /*return*/, axios_1.default.get("/magneto/boards".concat(urlParams))
	                    .then(function (res) { return new models_1.Boards(res.data); })];
	        });
	    }); },
	    getBoardsByIds: function (boardIds) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.post("/magneto/boards", { boardIds: boardIds })
	                    .then(function (res) { return new models_1.Boards(res.data); })];
	        });
	    }); },
	    getAllBoardsEditable: function () { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.get("/magneto/boards/editable")
	                    .then(function (res) { return new models_1.Boards(res.data); })];
	        });
	    }); },
	    createBoard: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.post("/magneto/board", params.toJSON())];
	        });
	    }); },
	    updateBoard: function (boardId, params) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.put("/magneto/board/".concat(boardId), params.toJSON())];
	        });
	    }); },
	    preDeleteBoards: function (boardIds) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.put("/magneto/boards/predelete", { boardIds: boardIds })];
	        });
	    }); },
	    restorePreDeleteBoards: function (boardIds) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.put("/magneto/boards/restore", { boardIds: boardIds })];
	        });
	    }); },
	    deleteBoards: function (boardIds) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.delete("/magneto/boards", { data: { boardIds: boardIds } })];
	        });
	    }); },
	    duplicateBoard: function (boardId) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.put("/magneto/board/duplicate/".concat(boardId))];
	        });
	    }); },
	    moveBoardsToFolder: function (boardIds, folderId) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.put("/magneto/boards/folder/".concat(folderId), { boardIds: boardIds })];
	        });
	    }); },
	    getAllDocumentIds: function (boardId) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.get("/magneto/boards/".concat(boardId, "/resources"))
	                    .then(function (res) { return res.data; })];
	        });
	    }); }
	};
	exports.BoardsService = entcore_1.ng.service('BoardsService', function () { return exports.boardsService; });


/***/ }),

/***/ 377:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(378);

/***/ }),

/***/ 378:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	var bind = __webpack_require__(380);
	var Axios = __webpack_require__(381);
	var mergeConfig = __webpack_require__(407);
	var defaults = __webpack_require__(386);
	
	/**
	 * Create an instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 * @return {Axios} A new instance of Axios
	 */
	function createInstance(defaultConfig) {
	  var context = new Axios(defaultConfig);
	  var instance = bind(Axios.prototype.request, context);
	
	  // Copy axios.prototype to instance
	  utils.extend(instance, Axios.prototype, context);
	
	  // Copy context to instance
	  utils.extend(instance, context);
	
	  // Factory for creating new instances
	  instance.create = function create(instanceConfig) {
	    return createInstance(mergeConfig(defaultConfig, instanceConfig));
	  };
	
	  return instance;
	}
	
	// Create the default instance to be exported
	var axios = createInstance(defaults);
	
	// Expose Axios class to allow class inheritance
	axios.Axios = Axios;
	
	// Expose Cancel & CancelToken
	axios.CanceledError = __webpack_require__(403);
	axios.CancelToken = __webpack_require__(410);
	axios.isCancel = __webpack_require__(406);
	axios.VERSION = __webpack_require__(409).version;
	axios.toFormData = __webpack_require__(390);
	
	// Expose AxiosError class
	axios.AxiosError = __webpack_require__(388);
	
	// alias for CanceledError for backward compatibility
	axios.Cancel = axios.CanceledError;
	
	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = __webpack_require__(411);
	
	// Expose isAxiosError
	axios.isAxiosError = __webpack_require__(412);
	
	module.exports = axios;
	
	// Allow use of default import syntax in TypeScript
	module.exports.default = axios;


/***/ }),

/***/ 379:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var bind = __webpack_require__(380);
	
	// utils is a library of generic helper functions non-specific to axios
	
	var toString = Object.prototype.toString;
	
	// eslint-disable-next-line func-names
	var kindOf = (function(cache) {
	  // eslint-disable-next-line func-names
	  return function(thing) {
	    var str = toString.call(thing);
	    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
	  };
	})(Object.create(null));
	
	function kindOfTest(type) {
	  type = type.toLowerCase();
	  return function isKindOf(thing) {
	    return kindOf(thing) === type;
	  };
	}
	
	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray(val) {
	  return Array.isArray(val);
	}
	
	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}
	
	/**
	 * Determine if a value is a Buffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Buffer, otherwise false
	 */
	function isBuffer(val) {
	  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
	    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
	}
	
	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @function
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	var isArrayBuffer = kindOfTest('ArrayBuffer');
	
	
	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  var result;
	  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
	  }
	  return result;
	}
	
	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
	  return typeof val === 'string';
	}
	
	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
	  return typeof val === 'number';
	}
	
	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject(val) {
	  return val !== null && typeof val === 'object';
	}
	
	/**
	 * Determine if a value is a plain Object
	 *
	 * @param {Object} val The value to test
	 * @return {boolean} True if value is a plain Object, otherwise false
	 */
	function isPlainObject(val) {
	  if (kindOf(val) !== 'object') {
	    return false;
	  }
	
	  var prototype = Object.getPrototypeOf(val);
	  return prototype === null || prototype === Object.prototype;
	}
	
	/**
	 * Determine if a value is a Date
	 *
	 * @function
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	var isDate = kindOfTest('Date');
	
	/**
	 * Determine if a value is a File
	 *
	 * @function
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	var isFile = kindOfTest('File');
	
	/**
	 * Determine if a value is a Blob
	 *
	 * @function
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	var isBlob = kindOfTest('Blob');
	
	/**
	 * Determine if a value is a FileList
	 *
	 * @function
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	var isFileList = kindOfTest('FileList');
	
	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
	  return toString.call(val) === '[object Function]';
	}
	
	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
	  return isObject(val) && isFunction(val.pipe);
	}
	
	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} thing The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(thing) {
	  var pattern = '[object FormData]';
	  return thing && (
	    (typeof FormData === 'function' && thing instanceof FormData) ||
	    toString.call(thing) === pattern ||
	    (isFunction(thing.toString) && thing.toString() === pattern)
	  );
	}
	
	/**
	 * Determine if a value is a URLSearchParams object
	 * @function
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	var isURLSearchParams = kindOfTest('URLSearchParams');
	
	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
	  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	}
	
	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  navigator.product -> 'ReactNative'
	 * nativescript
	 *  navigator.product -> 'NativeScript' or 'NS'
	 */
	function isStandardBrowserEnv() {
	  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
	                                           navigator.product === 'NativeScript' ||
	                                           navigator.product === 'NS')) {
	    return false;
	  }
	  return (
	    typeof window !== 'undefined' &&
	    typeof document !== 'undefined'
	  );
	}
	
	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }
	
	  // Force an array if not already something iterable
	  if (typeof obj !== 'object') {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }
	
	  if (isArray(obj)) {
	    // Iterate over array values
	    for (var i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Iterate over object keys
	    for (var key in obj) {
	      if (Object.prototype.hasOwnProperty.call(obj, key)) {
	        fn.call(null, obj[key], key, obj);
	      }
	    }
	  }
	}
	
	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge(/* obj1, obj2, obj3, ... */) {
	  var result = {};
	  function assignValue(val, key) {
	    if (isPlainObject(result[key]) && isPlainObject(val)) {
	      result[key] = merge(result[key], val);
	    } else if (isPlainObject(val)) {
	      result[key] = merge({}, val);
	    } else if (isArray(val)) {
	      result[key] = val.slice();
	    } else {
	      result[key] = val;
	    }
	  }
	
	  for (var i = 0, l = arguments.length; i < l; i++) {
	    forEach(arguments[i], assignValue);
	  }
	  return result;
	}
	
	/**
	 * Extends object a by mutably adding to it the properties of object b.
	 *
	 * @param {Object} a The object to be extended
	 * @param {Object} b The object to copy properties from
	 * @param {Object} thisArg The object to bind function to
	 * @return {Object} The resulting value of object a
	 */
	function extend(a, b, thisArg) {
	  forEach(b, function assignValue(val, key) {
	    if (thisArg && typeof val === 'function') {
	      a[key] = bind(val, thisArg);
	    } else {
	      a[key] = val;
	    }
	  });
	  return a;
	}
	
	/**
	 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
	 *
	 * @param {string} content with BOM
	 * @return {string} content value without BOM
	 */
	function stripBOM(content) {
	  if (content.charCodeAt(0) === 0xFEFF) {
	    content = content.slice(1);
	  }
	  return content;
	}
	
	/**
	 * Inherit the prototype methods from one constructor into another
	 * @param {function} constructor
	 * @param {function} superConstructor
	 * @param {object} [props]
	 * @param {object} [descriptors]
	 */
	
	function inherits(constructor, superConstructor, props, descriptors) {
	  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
	  constructor.prototype.constructor = constructor;
	  props && Object.assign(constructor.prototype, props);
	}
	
	/**
	 * Resolve object with deep prototype chain to a flat object
	 * @param {Object} sourceObj source object
	 * @param {Object} [destObj]
	 * @param {Function} [filter]
	 * @returns {Object}
	 */
	
	function toFlatObject(sourceObj, destObj, filter) {
	  var props;
	  var i;
	  var prop;
	  var merged = {};
	
	  destObj = destObj || {};
	
	  do {
	    props = Object.getOwnPropertyNames(sourceObj);
	    i = props.length;
	    while (i-- > 0) {
	      prop = props[i];
	      if (!merged[prop]) {
	        destObj[prop] = sourceObj[prop];
	        merged[prop] = true;
	      }
	    }
	    sourceObj = Object.getPrototypeOf(sourceObj);
	  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);
	
	  return destObj;
	}
	
	/*
	 * determines whether a string ends with the characters of a specified string
	 * @param {String} str
	 * @param {String} searchString
	 * @param {Number} [position= 0]
	 * @returns {boolean}
	 */
	function endsWith(str, searchString, position) {
	  str = String(str);
	  if (position === undefined || position > str.length) {
	    position = str.length;
	  }
	  position -= searchString.length;
	  var lastIndex = str.indexOf(searchString, position);
	  return lastIndex !== -1 && lastIndex === position;
	}
	
	
	/**
	 * Returns new array from array like object
	 * @param {*} [thing]
	 * @returns {Array}
	 */
	function toArray(thing) {
	  if (!thing) return null;
	  var i = thing.length;
	  if (isUndefined(i)) return null;
	  var arr = new Array(i);
	  while (i-- > 0) {
	    arr[i] = thing[i];
	  }
	  return arr;
	}
	
	// eslint-disable-next-line func-names
	var isTypedArray = (function(TypedArray) {
	  // eslint-disable-next-line func-names
	  return function(thing) {
	    return TypedArray && thing instanceof TypedArray;
	  };
	})(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));
	
	module.exports = {
	  isArray: isArray,
	  isArrayBuffer: isArrayBuffer,
	  isBuffer: isBuffer,
	  isFormData: isFormData,
	  isArrayBufferView: isArrayBufferView,
	  isString: isString,
	  isNumber: isNumber,
	  isObject: isObject,
	  isPlainObject: isPlainObject,
	  isUndefined: isUndefined,
	  isDate: isDate,
	  isFile: isFile,
	  isBlob: isBlob,
	  isFunction: isFunction,
	  isStream: isStream,
	  isURLSearchParams: isURLSearchParams,
	  isStandardBrowserEnv: isStandardBrowserEnv,
	  forEach: forEach,
	  merge: merge,
	  extend: extend,
	  trim: trim,
	  stripBOM: stripBOM,
	  inherits: inherits,
	  toFlatObject: toFlatObject,
	  kindOf: kindOf,
	  kindOfTest: kindOfTest,
	  endsWith: endsWith,
	  toArray: toArray,
	  isTypedArray: isTypedArray,
	  isFileList: isFileList
	};


/***/ }),

/***/ 380:
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function bind(fn, thisArg) {
	  return function wrap() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    return fn.apply(thisArg, args);
	  };
	};


/***/ }),

/***/ 381:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	var buildURL = __webpack_require__(382);
	var InterceptorManager = __webpack_require__(383);
	var dispatchRequest = __webpack_require__(384);
	var mergeConfig = __webpack_require__(407);
	var buildFullPath = __webpack_require__(398);
	var validator = __webpack_require__(408);
	
	var validators = validator.validators;
	/**
	 * Create a new instance of Axios
	 *
	 * @param {Object} instanceConfig The default config for the instance
	 */
	function Axios(instanceConfig) {
	  this.defaults = instanceConfig;
	  this.interceptors = {
	    request: new InterceptorManager(),
	    response: new InterceptorManager()
	  };
	}
	
	/**
	 * Dispatch a request
	 *
	 * @param {Object} config The config specific for this request (merged with this.defaults)
	 */
	Axios.prototype.request = function request(configOrUrl, config) {
	  /*eslint no-param-reassign:0*/
	  // Allow for axios('example/url'[, config]) a la fetch API
	  if (typeof configOrUrl === 'string') {
	    config = config || {};
	    config.url = configOrUrl;
	  } else {
	    config = configOrUrl || {};
	  }
	
	  config = mergeConfig(this.defaults, config);
	
	  // Set config.method
	  if (config.method) {
	    config.method = config.method.toLowerCase();
	  } else if (this.defaults.method) {
	    config.method = this.defaults.method.toLowerCase();
	  } else {
	    config.method = 'get';
	  }
	
	  var transitional = config.transitional;
	
	  if (transitional !== undefined) {
	    validator.assertOptions(transitional, {
	      silentJSONParsing: validators.transitional(validators.boolean),
	      forcedJSONParsing: validators.transitional(validators.boolean),
	      clarifyTimeoutError: validators.transitional(validators.boolean)
	    }, false);
	  }
	
	  // filter out skipped interceptors
	  var requestInterceptorChain = [];
	  var synchronousRequestInterceptors = true;
	  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
	      return;
	    }
	
	    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
	
	    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
	  });
	
	  var responseInterceptorChain = [];
	  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
	  });
	
	  var promise;
	
	  if (!synchronousRequestInterceptors) {
	    var chain = [dispatchRequest, undefined];
	
	    Array.prototype.unshift.apply(chain, requestInterceptorChain);
	    chain = chain.concat(responseInterceptorChain);
	
	    promise = Promise.resolve(config);
	    while (chain.length) {
	      promise = promise.then(chain.shift(), chain.shift());
	    }
	
	    return promise;
	  }
	
	
	  var newConfig = config;
	  while (requestInterceptorChain.length) {
	    var onFulfilled = requestInterceptorChain.shift();
	    var onRejected = requestInterceptorChain.shift();
	    try {
	      newConfig = onFulfilled(newConfig);
	    } catch (error) {
	      onRejected(error);
	      break;
	    }
	  }
	
	  try {
	    promise = dispatchRequest(newConfig);
	  } catch (error) {
	    return Promise.reject(error);
	  }
	
	  while (responseInterceptorChain.length) {
	    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
	  }
	
	  return promise;
	};
	
	Axios.prototype.getUri = function getUri(config) {
	  config = mergeConfig(this.defaults, config);
	  var fullPath = buildFullPath(config.baseURL, config.url);
	  return buildURL(fullPath, config.params, config.paramsSerializer);
	};
	
	// Provide aliases for supported request methods
	utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, config) {
	    return this.request(mergeConfig(config || {}, {
	      method: method,
	      url: url,
	      data: (config || {}).data
	    }));
	  };
	});
	
	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  /*eslint func-names:0*/
	
	  function generateHTTPMethod(isForm) {
	    return function httpMethod(url, data, config) {
	      return this.request(mergeConfig(config || {}, {
	        method: method,
	        headers: isForm ? {
	          'Content-Type': 'multipart/form-data'
	        } : {},
	        url: url,
	        data: data
	      }));
	    };
	  }
	
	  Axios.prototype[method] = generateHTTPMethod();
	
	  Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
	});
	
	module.exports = Axios;


/***/ }),

/***/ 382:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	
	function encode(val) {
	  return encodeURIComponent(val).
	    replace(/%3A/gi, ':').
	    replace(/%24/g, '$').
	    replace(/%2C/gi, ',').
	    replace(/%20/g, '+').
	    replace(/%5B/gi, '[').
	    replace(/%5D/gi, ']');
	}
	
	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @returns {string} The formatted url
	 */
	module.exports = function buildURL(url, params, paramsSerializer) {
	  /*eslint no-param-reassign:0*/
	  if (!params) {
	    return url;
	  }
	
	  var serializedParams;
	  if (paramsSerializer) {
	    serializedParams = paramsSerializer(params);
	  } else if (utils.isURLSearchParams(params)) {
	    serializedParams = params.toString();
	  } else {
	    var parts = [];
	
	    utils.forEach(params, function serialize(val, key) {
	      if (val === null || typeof val === 'undefined') {
	        return;
	      }
	
	      if (utils.isArray(val)) {
	        key = key + '[]';
	      } else {
	        val = [val];
	      }
	
	      utils.forEach(val, function parseValue(v) {
	        if (utils.isDate(v)) {
	          v = v.toISOString();
	        } else if (utils.isObject(v)) {
	          v = JSON.stringify(v);
	        }
	        parts.push(encode(key) + '=' + encode(v));
	      });
	    });
	
	    serializedParams = parts.join('&');
	  }
	
	  if (serializedParams) {
	    var hashmarkIndex = url.indexOf('#');
	    if (hashmarkIndex !== -1) {
	      url = url.slice(0, hashmarkIndex);
	    }
	
	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }
	
	  return url;
	};


/***/ }),

/***/ 383:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	
	function InterceptorManager() {
	  this.handlers = [];
	}
	
	/**
	 * Add a new interceptor to the stack
	 *
	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
	 * @param {Function} rejected The function to handle `reject` for a `Promise`
	 *
	 * @return {Number} An ID used to remove interceptor later
	 */
	InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
	  this.handlers.push({
	    fulfilled: fulfilled,
	    rejected: rejected,
	    synchronous: options ? options.synchronous : false,
	    runWhen: options ? options.runWhen : null
	  });
	  return this.handlers.length - 1;
	};
	
	/**
	 * Remove an interceptor from the stack
	 *
	 * @param {Number} id The ID that was returned by `use`
	 */
	InterceptorManager.prototype.eject = function eject(id) {
	  if (this.handlers[id]) {
	    this.handlers[id] = null;
	  }
	};
	
	/**
	 * Iterate over all the registered interceptors
	 *
	 * This method is particularly useful for skipping over any
	 * interceptors that may have become `null` calling `eject`.
	 *
	 * @param {Function} fn The function to call for each interceptor
	 */
	InterceptorManager.prototype.forEach = function forEach(fn) {
	  utils.forEach(this.handlers, function forEachHandler(h) {
	    if (h !== null) {
	      fn(h);
	    }
	  });
	};
	
	module.exports = InterceptorManager;


/***/ }),

/***/ 384:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	var transformData = __webpack_require__(385);
	var isCancel = __webpack_require__(406);
	var defaults = __webpack_require__(386);
	var CanceledError = __webpack_require__(403);
	
	/**
	 * Throws a `CanceledError` if cancellation has been requested.
	 */
	function throwIfCancellationRequested(config) {
	  if (config.cancelToken) {
	    config.cancelToken.throwIfRequested();
	  }
	
	  if (config.signal && config.signal.aborted) {
	    throw new CanceledError();
	  }
	}
	
	/**
	 * Dispatch a request to the server using the configured adapter.
	 *
	 * @param {object} config The config that is to be used for the request
	 * @returns {Promise} The Promise to be fulfilled
	 */
	module.exports = function dispatchRequest(config) {
	  throwIfCancellationRequested(config);
	
	  // Ensure headers exist
	  config.headers = config.headers || {};
	
	  // Transform request data
	  config.data = transformData.call(
	    config,
	    config.data,
	    config.headers,
	    config.transformRequest
	  );
	
	  // Flatten headers
	  config.headers = utils.merge(
	    config.headers.common || {},
	    config.headers[config.method] || {},
	    config.headers
	  );
	
	  utils.forEach(
	    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
	    function cleanHeaderConfig(method) {
	      delete config.headers[method];
	    }
	  );
	
	  var adapter = config.adapter || defaults.adapter;
	
	  return adapter(config).then(function onAdapterResolution(response) {
	    throwIfCancellationRequested(config);
	
	    // Transform response data
	    response.data = transformData.call(
	      config,
	      response.data,
	      response.headers,
	      config.transformResponse
	    );
	
	    return response;
	  }, function onAdapterRejection(reason) {
	    if (!isCancel(reason)) {
	      throwIfCancellationRequested(config);
	
	      // Transform response data
	      if (reason && reason.response) {
	        reason.response.data = transformData.call(
	          config,
	          reason.response.data,
	          reason.response.headers,
	          config.transformResponse
	        );
	      }
	    }
	
	    return Promise.reject(reason);
	  });
	};


/***/ }),

/***/ 385:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	var defaults = __webpack_require__(386);
	
	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Object|String} data The data to be transformed
	 * @param {Array} headers The headers for the request or response
	 * @param {Array|Function} fns A single function or Array of functions
	 * @returns {*} The resulting transformed data
	 */
	module.exports = function transformData(data, headers, fns) {
	  var context = this || defaults;
	  /*eslint no-param-reassign:0*/
	  utils.forEach(fns, function transform(fn) {
	    data = fn.call(context, data, headers);
	  });
	
	  return data;
	};


/***/ }),

/***/ 386:
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var utils = __webpack_require__(379);
	var normalizeHeaderName = __webpack_require__(387);
	var AxiosError = __webpack_require__(388);
	var transitionalDefaults = __webpack_require__(389);
	var toFormData = __webpack_require__(390);
	
	var DEFAULT_CONTENT_TYPE = {
	  'Content-Type': 'application/x-www-form-urlencoded'
	};
	
	function setContentTypeIfUnset(headers, value) {
	  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
	    headers['Content-Type'] = value;
	  }
	}
	
	function getDefaultAdapter() {
	  var adapter;
	  if (typeof XMLHttpRequest !== 'undefined') {
	    // For browsers use XHR adapter
	    adapter = __webpack_require__(395);
	  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
	    // For node use HTTP adapter
	    adapter = __webpack_require__(395);
	  }
	  return adapter;
	}
	
	function stringifySafely(rawValue, parser, encoder) {
	  if (utils.isString(rawValue)) {
	    try {
	      (parser || JSON.parse)(rawValue);
	      return utils.trim(rawValue);
	    } catch (e) {
	      if (e.name !== 'SyntaxError') {
	        throw e;
	      }
	    }
	  }
	
	  return (encoder || JSON.stringify)(rawValue);
	}
	
	var defaults = {
	
	  transitional: transitionalDefaults,
	
	  adapter: getDefaultAdapter(),
	
	  transformRequest: [function transformRequest(data, headers) {
	    normalizeHeaderName(headers, 'Accept');
	    normalizeHeaderName(headers, 'Content-Type');
	
	    if (utils.isFormData(data) ||
	      utils.isArrayBuffer(data) ||
	      utils.isBuffer(data) ||
	      utils.isStream(data) ||
	      utils.isFile(data) ||
	      utils.isBlob(data)
	    ) {
	      return data;
	    }
	    if (utils.isArrayBufferView(data)) {
	      return data.buffer;
	    }
	    if (utils.isURLSearchParams(data)) {
	      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
	      return data.toString();
	    }
	
	    var isObjectPayload = utils.isObject(data);
	    var contentType = headers && headers['Content-Type'];
	
	    var isFileList;
	
	    if ((isFileList = utils.isFileList(data)) || (isObjectPayload && contentType === 'multipart/form-data')) {
	      var _FormData = this.env && this.env.FormData;
	      return toFormData(isFileList ? {'files[]': data} : data, _FormData && new _FormData());
	    } else if (isObjectPayload || contentType === 'application/json') {
	      setContentTypeIfUnset(headers, 'application/json');
	      return stringifySafely(data);
	    }
	
	    return data;
	  }],
	
	  transformResponse: [function transformResponse(data) {
	    var transitional = this.transitional || defaults.transitional;
	    var silentJSONParsing = transitional && transitional.silentJSONParsing;
	    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
	    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';
	
	    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
	      try {
	        return JSON.parse(data);
	      } catch (e) {
	        if (strictJSONParsing) {
	          if (e.name === 'SyntaxError') {
	            throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
	          }
	          throw e;
	        }
	      }
	    }
	
	    return data;
	  }],
	
	  /**
	   * A timeout in milliseconds to abort a request. If set to 0 (default) a
	   * timeout is not created.
	   */
	  timeout: 0,
	
	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',
	
	  maxContentLength: -1,
	  maxBodyLength: -1,
	
	  env: {
	    FormData: __webpack_require__(405)
	  },
	
	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  },
	
	  headers: {
	    common: {
	      'Accept': 'application/json, text/plain, */*'
	    }
	  }
	};
	
	utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
	  defaults.headers[method] = {};
	});
	
	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
	});
	
	module.exports = defaults;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(309)))

/***/ }),

/***/ 387:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	
	module.exports = function normalizeHeaderName(headers, normalizedName) {
	  utils.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};


/***/ }),

/***/ 388:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	
	/**
	 * Create an Error with the specified message, config, error code, request and response.
	 *
	 * @param {string} message The error message.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 * @param {Object} [config] The config.
	 * @param {Object} [request] The request.
	 * @param {Object} [response] The response.
	 * @returns {Error} The created error.
	 */
	function AxiosError(message, code, config, request, response) {
	  Error.call(this);
	  this.message = message;
	  this.name = 'AxiosError';
	  code && (this.code = code);
	  config && (this.config = config);
	  request && (this.request = request);
	  response && (this.response = response);
	}
	
	utils.inherits(AxiosError, Error, {
	  toJSON: function toJSON() {
	    return {
	      // Standard
	      message: this.message,
	      name: this.name,
	      // Microsoft
	      description: this.description,
	      number: this.number,
	      // Mozilla
	      fileName: this.fileName,
	      lineNumber: this.lineNumber,
	      columnNumber: this.columnNumber,
	      stack: this.stack,
	      // Axios
	      config: this.config,
	      code: this.code,
	      status: this.response && this.response.status ? this.response.status : null
	    };
	  }
	});
	
	var prototype = AxiosError.prototype;
	var descriptors = {};
	
	[
	  'ERR_BAD_OPTION_VALUE',
	  'ERR_BAD_OPTION',
	  'ECONNABORTED',
	  'ETIMEDOUT',
	  'ERR_NETWORK',
	  'ERR_FR_TOO_MANY_REDIRECTS',
	  'ERR_DEPRECATED',
	  'ERR_BAD_RESPONSE',
	  'ERR_BAD_REQUEST',
	  'ERR_CANCELED'
	// eslint-disable-next-line func-names
	].forEach(function(code) {
	  descriptors[code] = {value: code};
	});
	
	Object.defineProperties(AxiosError, descriptors);
	Object.defineProperty(prototype, 'isAxiosError', {value: true});
	
	// eslint-disable-next-line func-names
	AxiosError.from = function(error, code, config, request, response, customProps) {
	  var axiosError = Object.create(prototype);
	
	  utils.toFlatObject(error, axiosError, function filter(obj) {
	    return obj !== Error.prototype;
	  });
	
	  AxiosError.call(axiosError, error.message, code, config, request, response);
	
	  axiosError.name = error.name;
	
	  customProps && Object.assign(axiosError, customProps);
	
	  return axiosError;
	};
	
	module.exports = AxiosError;


/***/ }),

/***/ 389:
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = {
	  silentJSONParsing: true,
	  forcedJSONParsing: true,
	  clarifyTimeoutError: false
	};


/***/ }),

/***/ 390:
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {'use strict';
	
	var utils = __webpack_require__(379);
	
	/**
	 * Convert a data object to FormData
	 * @param {Object} obj
	 * @param {?Object} [formData]
	 * @returns {Object}
	 **/
	
	function toFormData(obj, formData) {
	  // eslint-disable-next-line no-param-reassign
	  formData = formData || new FormData();
	
	  var stack = [];
	
	  function convertValue(value) {
	    if (value === null) return '';
	
	    if (utils.isDate(value)) {
	      return value.toISOString();
	    }
	
	    if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
	      return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
	    }
	
	    return value;
	  }
	
	  function build(data, parentKey) {
	    if (utils.isPlainObject(data) || utils.isArray(data)) {
	      if (stack.indexOf(data) !== -1) {
	        throw Error('Circular reference detected in ' + parentKey);
	      }
	
	      stack.push(data);
	
	      utils.forEach(data, function each(value, key) {
	        if (utils.isUndefined(value)) return;
	        var fullKey = parentKey ? parentKey + '.' + key : key;
	        var arr;
	
	        if (value && !parentKey && typeof value === 'object') {
	          if (utils.endsWith(key, '{}')) {
	            // eslint-disable-next-line no-param-reassign
	            value = JSON.stringify(value);
	          } else if (utils.endsWith(key, '[]') && (arr = utils.toArray(value))) {
	            // eslint-disable-next-line func-names
	            arr.forEach(function(el) {
	              !utils.isUndefined(el) && formData.append(fullKey, convertValue(el));
	            });
	            return;
	          }
	        }
	
	        build(value, fullKey);
	      });
	
	      stack.pop();
	    } else {
	      formData.append(parentKey, convertValue(data));
	    }
	  }
	
	  build(obj);
	
	  return formData;
	}
	
	module.exports = toFormData;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(391).Buffer))

/***/ }),

/***/ 391:
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */
	
	'use strict'
	
	var base64 = __webpack_require__(392)
	var ieee754 = __webpack_require__(393)
	var isArray = __webpack_require__(394)
	
	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	
	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.
	
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()
	
	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	exports.kMaxLength = kMaxLength()
	
	function typedArraySupport () {
	  try {
	    var arr = new Uint8Array(1)
	    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}
	
	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}
	
	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length)
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer(length)
	    }
	    that.length = length
	  }
	
	  return that
	}
	
	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */
	
	function Buffer (arg, encodingOrOffset, length) {
	  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	    return new Buffer(arg, encodingOrOffset, length)
	  }
	
	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}
	
	Buffer.poolSize = 8192 // not used by this implementation
	
	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	  arr.__proto__ = Buffer.prototype
	  return arr
	}
	
	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }
	
	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }
	
	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }
	
	  return fromObject(that, value)
	}
	
	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	}
	
	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	  if (typeof Symbol !== 'undefined' && Symbol.species &&
	      Buffer[Symbol.species] === Buffer) {
	    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
	    Object.defineProperty(Buffer, Symbol.species, {
	      value: null,
	      configurable: true
	    })
	  }
	}
	
	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  } else if (size < 0) {
	    throw new RangeError('"size" argument must not be negative')
	  }
	}
	
	function alloc (that, size, fill, encoding) {
	  assertSize(size)
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}
	
	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	}
	
	function allocUnsafe (that, size) {
	  assertSize(size)
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; ++i) {
	      that[i] = 0
	    }
	  }
	  return that
	}
	
	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	}
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	}
	
	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8'
	  }
	
	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }
	
	  var length = byteLength(string, encoding) | 0
	  that = createBuffer(that, length)
	
	  var actual = that.write(string, encoding)
	
	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    that = that.slice(0, actual)
	  }
	
	  return that
	}
	
	function fromArrayLike (that, array) {
	  var length = array.length < 0 ? 0 : checked(array.length) | 0
	  that = createBuffer(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength // this throws if `array` is not a valid ArrayBuffer
	
	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }
	
	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }
	
	  if (byteOffset === undefined && length === undefined) {
	    array = new Uint8Array(array)
	  } else if (length === undefined) {
	    array = new Uint8Array(array, byteOffset)
	  } else {
	    array = new Uint8Array(array, byteOffset, length)
	  }
	
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array)
	  }
	  return that
	}
	
	function fromObject (that, obj) {
	  if (Buffer.isBuffer(obj)) {
	    var len = checked(obj.length) | 0
	    that = createBuffer(that, len)
	
	    if (that.length === 0) {
	      return that
	    }
	
	    obj.copy(that, 0, 0, len)
	    return that
	  }
	
	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }
	
	    if (obj.type === 'Buffer' && isArray(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }
	
	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}
	
	function checked (length) {
	  // Note: cannot use `length < kMaxLength()` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}
	
	function SlowBuffer (length) {
	  if (+length != length) { // eslint-disable-line eqeqeq
	    length = 0
	  }
	  return Buffer.alloc(+length)
	}
	
	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}
	
	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }
	
	  if (a === b) return 0
	
	  var x = a.length
	  var y = b.length
	
	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i]
	      y = b[i]
	      break
	    }
	  }
	
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}
	
	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }
	
	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }
	
	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length
	    }
	  }
	
	  var buffer = Buffer.allocUnsafe(length)
	  var pos = 0
	  for (i = 0; i < list.length; ++i) {
	    var buf = list[i]
	    if (!Buffer.isBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos)
	    pos += buf.length
	  }
	  return buffer
	}
	
	function byteLength (string, encoding) {
	  if (Buffer.isBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string
	  }
	
	  var len = string.length
	  if (len === 0) return 0
	
	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength
	
	function slowToString (encoding, start, end) {
	  var loweredCase = false
	
	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.
	
	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }
	
	  if (end === undefined || end > this.length) {
	    end = this.length
	  }
	
	  if (end <= 0) {
	    return ''
	  }
	
	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0
	  start >>>= 0
	
	  if (end <= start) {
	    return ''
	  }
	
	  if (!encoding) encoding = 'utf8'
	
	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)
	
	      case 'ascii':
	        return asciiSlice(this, start, end)
	
	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)
	
	      case 'base64':
	        return base64Slice(this, start, end)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true
	
	function swap (b, n, m) {
	  var i = b[n]
	  b[n] = b[m]
	  b[m] = i
	}
	
	Buffer.prototype.swap16 = function swap16 () {
	  var len = this.length
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1)
	  }
	  return this
	}
	
	Buffer.prototype.swap32 = function swap32 () {
	  var len = this.length
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3)
	    swap(this, i + 1, i + 2)
	  }
	  return this
	}
	
	Buffer.prototype.swap64 = function swap64 () {
	  var len = this.length
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (var i = 0; i < len; i += 8) {
	    swap(this, i, i + 7)
	    swap(this, i + 1, i + 6)
	    swap(this, i + 2, i + 5)
	    swap(this, i + 3, i + 4)
	  }
	  return this
	}
	
	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}
	
	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}
	
	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}
	
	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!Buffer.isBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }
	
	  if (start === undefined) {
	    start = 0
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0
	  }
	  if (thisStart === undefined) {
	    thisStart = 0
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length
	  }
	
	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }
	
	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }
	
	  start >>>= 0
	  end >>>= 0
	  thisStart >>>= 0
	  thisEnd >>>= 0
	
	  if (this === target) return 0
	
	  var x = thisEnd - thisStart
	  var y = end - start
	  var len = Math.min(x, y)
	
	  var thisCopy = this.slice(thisStart, thisEnd)
	  var targetCopy = target.slice(start, end)
	
	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i]
	      y = targetCopy[i]
	      break
	    }
	  }
	
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1
	
	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset
	    byteOffset = 0
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000
	  }
	  byteOffset = +byteOffset  // Coerce to Number.
	  if (isNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1)
	  }
	
	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0
	    else return -1
	  }
	
	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding)
	  }
	
	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (Buffer.isBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF // Search for a byte value [0-255]
	    if (Buffer.TYPED_ARRAY_SUPPORT &&
	        typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
	  }
	
	  throw new TypeError('val must be string, number or Buffer')
	}
	
	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
	  var indexSize = 1
	  var arrLength = arr.length
	  var valLength = val.length
	
	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase()
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2
	      arrLength /= 2
	      valLength /= 2
	      byteOffset /= 2
	    }
	  }
	
	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }
	
	  var i
	  if (dir) {
	    var foundIndex = -1
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex
	        foundIndex = -1
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
	    for (i = byteOffset; i >= 0; i--) {
	      var found = true
	      for (var j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false
	          break
	        }
	      }
	      if (found) return i
	    }
	  }
	
	  return -1
	}
	
	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	}
	
	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	}
	
	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	}
	
	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	
	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')
	
	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; ++i) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed
	  }
	  return i
	}
	
	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}
	
	function latin1Write (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}
	
	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}
	
	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }
	
	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining
	
	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }
	
	  if (!encoding) encoding = 'utf8'
	
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)
	
	      case 'ascii':
	        return asciiWrite(this, string, offset, length)
	
	      case 'latin1':
	      case 'binary':
	        return latin1Write(this, string, offset, length)
	
	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}
	
	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}
	
	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []
	
	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1
	
	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint
	
	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }
	
	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }
	
	    res.push(codePoint)
	    i += bytesPerSequence
	  }
	
	  return decodeCodePointsArray(res)
	}
	
	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000
	
	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }
	
	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}
	
	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}
	
	function latin1Slice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}
	
	function hexSlice (buf, start, end) {
	  var len = buf.length
	
	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len
	
	  var out = ''
	  for (var i = start; i < end; ++i) {
	    out += toHex(buf[i])
	  }
	  return out
	}
	
	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}
	
	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end
	
	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }
	
	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }
	
	  if (end < start) end = start
	
	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end)
	    newBuf.__proto__ = Buffer.prototype
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; ++i) {
	      newBuf[i] = this[i + start]
	    }
	  }
	
	  return newBuf
	}
	
	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}
	
	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }
	
	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}
	
	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}
	
	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}
	
	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}
	
	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}
	
	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}
	
	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}
	
	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}
	
	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}
	
	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}
	
	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}
	
	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}
	
	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}
	
	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }
	
	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }
	
	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}
	
	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}
	
	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = 0
	  var mul = 1
	  var sub = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = byteLength - 1
	  var mul = 1
	  var sub = 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}
	
	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}
	
	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}
	
	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}
	
	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}
	
	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start
	
	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0
	
	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')
	
	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }
	
	  var len = end - start
	  var i
	
	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; --i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; ++i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    )
	  }
	
	  return len
	}
	
	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start
	      start = 0
	      end = this.length
	    } else if (typeof end === 'string') {
	      encoding = end
	      end = this.length
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0)
	      if (code < 256) {
	        val = code
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255
	  }
	
	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }
	
	  if (end <= start) {
	    return this
	  }
	
	  start = start >>> 0
	  end = end === undefined ? this.length : end >>> 0
	
	  if (!val) val = 0
	
	  var i
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val
	    }
	  } else {
	    var bytes = Buffer.isBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer(val, encoding).toString())
	    var len = bytes.length
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len]
	    }
	  }
	
	  return this
	}
	
	// HELPER FUNCTIONS
	// ================
	
	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g
	
	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}
	
	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}
	
	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}
	
	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []
	
	  for (var i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i)
	
	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }
	
	        // valid lead
	        leadSurrogate = codePoint
	
	        continue
	      }
	
	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }
	
	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }
	
	    leadSurrogate = null
	
	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }
	
	  return bytes
	}
	
	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}
	
	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break
	
	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }
	
	  return byteArray
	}
	
	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}
	
	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}
	
	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),

/***/ 392:
/***/ (function(module, exports) {

	'use strict'
	
	exports.byteLength = byteLength
	exports.toByteArray = toByteArray
	exports.fromByteArray = fromByteArray
	
	var lookup = []
	var revLookup = []
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
	
	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i]
	  revLookup[code.charCodeAt(i)] = i
	}
	
	// Support decoding URL-safe base64 strings, as Node.js does.
	// See: https://en.wikipedia.org/wiki/Base64#URL_applications
	revLookup['-'.charCodeAt(0)] = 62
	revLookup['_'.charCodeAt(0)] = 63
	
	function getLens (b64) {
	  var len = b64.length
	
	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }
	
	  // Trim off extra bytes after placeholder bytes are found
	  // See: https://github.com/beatgammit/base64-js/issues/42
	  var validLen = b64.indexOf('=')
	  if (validLen === -1) validLen = len
	
	  var placeHoldersLen = validLen === len
	    ? 0
	    : 4 - (validLen % 4)
	
	  return [validLen, placeHoldersLen]
	}
	
	// base64 is 4/3 + up to two characters of the original data
	function byteLength (b64) {
	  var lens = getLens(b64)
	  var validLen = lens[0]
	  var placeHoldersLen = lens[1]
	  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
	}
	
	function _byteLength (b64, validLen, placeHoldersLen) {
	  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
	}
	
	function toByteArray (b64) {
	  var tmp
	  var lens = getLens(b64)
	  var validLen = lens[0]
	  var placeHoldersLen = lens[1]
	
	  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))
	
	  var curByte = 0
	
	  // if there are placeholders, only get up to the last complete 4 chars
	  var len = placeHoldersLen > 0
	    ? validLen - 4
	    : validLen
	
	  var i
	  for (i = 0; i < len; i += 4) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 18) |
	      (revLookup[b64.charCodeAt(i + 1)] << 12) |
	      (revLookup[b64.charCodeAt(i + 2)] << 6) |
	      revLookup[b64.charCodeAt(i + 3)]
	    arr[curByte++] = (tmp >> 16) & 0xFF
	    arr[curByte++] = (tmp >> 8) & 0xFF
	    arr[curByte++] = tmp & 0xFF
	  }
	
	  if (placeHoldersLen === 2) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 2) |
	      (revLookup[b64.charCodeAt(i + 1)] >> 4)
	    arr[curByte++] = tmp & 0xFF
	  }
	
	  if (placeHoldersLen === 1) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 10) |
	      (revLookup[b64.charCodeAt(i + 1)] << 4) |
	      (revLookup[b64.charCodeAt(i + 2)] >> 2)
	    arr[curByte++] = (tmp >> 8) & 0xFF
	    arr[curByte++] = tmp & 0xFF
	  }
	
	  return arr
	}
	
	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] +
	    lookup[num >> 12 & 0x3F] +
	    lookup[num >> 6 & 0x3F] +
	    lookup[num & 0x3F]
	}
	
	function encodeChunk (uint8, start, end) {
	  var tmp
	  var output = []
	  for (var i = start; i < end; i += 3) {
	    tmp =
	      ((uint8[i] << 16) & 0xFF0000) +
	      ((uint8[i + 1] << 8) & 0xFF00) +
	      (uint8[i + 2] & 0xFF)
	    output.push(tripletToBase64(tmp))
	  }
	  return output.join('')
	}
	
	function fromByteArray (uint8) {
	  var tmp
	  var len = uint8.length
	  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
	  var parts = []
	  var maxChunkLength = 16383 // must be multiple of 3
	
	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
	  }
	
	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1]
	    parts.push(
	      lookup[tmp >> 2] +
	      lookup[(tmp << 4) & 0x3F] +
	      '=='
	    )
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
	    parts.push(
	      lookup[tmp >> 10] +
	      lookup[(tmp >> 4) & 0x3F] +
	      lookup[(tmp << 2) & 0x3F] +
	      '='
	    )
	  }
	
	  return parts.join('')
	}


/***/ }),

/***/ 393:
/***/ (function(module, exports) {

	/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = (nBytes * 8) - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]
	
	  i += d
	
	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}
	
	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}
	
	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}
	
	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = (nBytes * 8) - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
	
	  value = Math.abs(value)
	
	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }
	
	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = ((value * c) - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }
	
	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
	
	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
	
	  buffer[offset + i - d] |= s * 128
	}


/***/ }),

/***/ 394:
/***/ (function(module, exports) {

	var toString = {}.toString;
	
	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ }),

/***/ 395:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	var settle = __webpack_require__(396);
	var cookies = __webpack_require__(397);
	var buildURL = __webpack_require__(382);
	var buildFullPath = __webpack_require__(398);
	var parseHeaders = __webpack_require__(401);
	var isURLSameOrigin = __webpack_require__(402);
	var transitionalDefaults = __webpack_require__(389);
	var AxiosError = __webpack_require__(388);
	var CanceledError = __webpack_require__(403);
	var parseProtocol = __webpack_require__(404);
	
	module.exports = function xhrAdapter(config) {
	  return new Promise(function dispatchXhrRequest(resolve, reject) {
	    var requestData = config.data;
	    var requestHeaders = config.headers;
	    var responseType = config.responseType;
	    var onCanceled;
	    function done() {
	      if (config.cancelToken) {
	        config.cancelToken.unsubscribe(onCanceled);
	      }
	
	      if (config.signal) {
	        config.signal.removeEventListener('abort', onCanceled);
	      }
	    }
	
	    if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
	      delete requestHeaders['Content-Type']; // Let the browser set it
	    }
	
	    var request = new XMLHttpRequest();
	
	    // HTTP basic authentication
	    if (config.auth) {
	      var username = config.auth.username || '';
	      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
	      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
	    }
	
	    var fullPath = buildFullPath(config.baseURL, config.url);
	
	    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
	
	    // Set the request timeout in MS
	    request.timeout = config.timeout;
	
	    function onloadend() {
	      if (!request) {
	        return;
	      }
	      // Prepare the response
	      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
	      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
	        request.responseText : request.response;
	      var response = {
	        data: responseData,
	        status: request.status,
	        statusText: request.statusText,
	        headers: responseHeaders,
	        config: config,
	        request: request
	      };
	
	      settle(function _resolve(value) {
	        resolve(value);
	        done();
	      }, function _reject(err) {
	        reject(err);
	        done();
	      }, response);
	
	      // Clean up request
	      request = null;
	    }
	
	    if ('onloadend' in request) {
	      // Use onloadend if available
	      request.onloadend = onloadend;
	    } else {
	      // Listen for ready state to emulate onloadend
	      request.onreadystatechange = function handleLoad() {
	        if (!request || request.readyState !== 4) {
	          return;
	        }
	
	        // The request errored out and we didn't get a response, this will be
	        // handled by onerror instead
	        // With one exception: request that using file: protocol, most browsers
	        // will return status as 0 even though it's a successful request
	        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
	          return;
	        }
	        // readystate handler is calling before onerror or ontimeout handlers,
	        // so we should call onloadend on the next 'tick'
	        setTimeout(onloadend);
	      };
	    }
	
	    // Handle browser request cancellation (as opposed to a manual cancellation)
	    request.onabort = function handleAbort() {
	      if (!request) {
	        return;
	      }
	
	      reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));
	
	      // Clean up request
	      request = null;
	    };
	
	    // Handle low level network errors
	    request.onerror = function handleError() {
	      // Real errors are hidden from us by the browser
	      // onerror should only fire if it's a network error
	      reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request, request));
	
	      // Clean up request
	      request = null;
	    };
	
	    // Handle timeout
	    request.ontimeout = function handleTimeout() {
	      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
	      var transitional = config.transitional || transitionalDefaults;
	      if (config.timeoutErrorMessage) {
	        timeoutErrorMessage = config.timeoutErrorMessage;
	      }
	      reject(new AxiosError(
	        timeoutErrorMessage,
	        transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
	        config,
	        request));
	
	      // Clean up request
	      request = null;
	    };
	
	    // Add xsrf header
	    // This is only done if running in a standard browser environment.
	    // Specifically not if we're in a web worker, or react-native.
	    if (utils.isStandardBrowserEnv()) {
	      // Add xsrf header
	      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
	        cookies.read(config.xsrfCookieName) :
	        undefined;
	
	      if (xsrfValue) {
	        requestHeaders[config.xsrfHeaderName] = xsrfValue;
	      }
	    }
	
	    // Add headers to the request
	    if ('setRequestHeader' in request) {
	      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
	        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
	          // Remove Content-Type if data is undefined
	          delete requestHeaders[key];
	        } else {
	          // Otherwise add header to the request
	          request.setRequestHeader(key, val);
	        }
	      });
	    }
	
	    // Add withCredentials to request if needed
	    if (!utils.isUndefined(config.withCredentials)) {
	      request.withCredentials = !!config.withCredentials;
	    }
	
	    // Add responseType to request if needed
	    if (responseType && responseType !== 'json') {
	      request.responseType = config.responseType;
	    }
	
	    // Handle progress if needed
	    if (typeof config.onDownloadProgress === 'function') {
	      request.addEventListener('progress', config.onDownloadProgress);
	    }
	
	    // Not all browsers support upload events
	    if (typeof config.onUploadProgress === 'function' && request.upload) {
	      request.upload.addEventListener('progress', config.onUploadProgress);
	    }
	
	    if (config.cancelToken || config.signal) {
	      // Handle cancellation
	      // eslint-disable-next-line func-names
	      onCanceled = function(cancel) {
	        if (!request) {
	          return;
	        }
	        reject(!cancel || (cancel && cancel.type) ? new CanceledError() : cancel);
	        request.abort();
	        request = null;
	      };
	
	      config.cancelToken && config.cancelToken.subscribe(onCanceled);
	      if (config.signal) {
	        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
	      }
	    }
	
	    if (!requestData) {
	      requestData = null;
	    }
	
	    var protocol = parseProtocol(fullPath);
	
	    if (protocol && [ 'http', 'https', 'file' ].indexOf(protocol) === -1) {
	      reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
	      return;
	    }
	
	
	    // Send the request
	    request.send(requestData);
	  });
	};


/***/ }),

/***/ 396:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var AxiosError = __webpack_require__(388);
	
	/**
	 * Resolve or reject a Promise based on response status.
	 *
	 * @param {Function} resolve A function that resolves the promise.
	 * @param {Function} reject A function that rejects the promise.
	 * @param {object} response The response.
	 */
	module.exports = function settle(resolve, reject, response) {
	  var validateStatus = response.config.validateStatus;
	  if (!response.status || !validateStatus || validateStatus(response.status)) {
	    resolve(response);
	  } else {
	    reject(new AxiosError(
	      'Request failed with status code ' + response.status,
	      [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
	      response.config,
	      response.request,
	      response
	    ));
	  }
	};


/***/ }),

/***/ 397:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	
	module.exports = (
	  utils.isStandardBrowserEnv() ?
	
	  // Standard browser envs support document.cookie
	    (function standardBrowserEnv() {
	      return {
	        write: function write(name, value, expires, path, domain, secure) {
	          var cookie = [];
	          cookie.push(name + '=' + encodeURIComponent(value));
	
	          if (utils.isNumber(expires)) {
	            cookie.push('expires=' + new Date(expires).toGMTString());
	          }
	
	          if (utils.isString(path)) {
	            cookie.push('path=' + path);
	          }
	
	          if (utils.isString(domain)) {
	            cookie.push('domain=' + domain);
	          }
	
	          if (secure === true) {
	            cookie.push('secure');
	          }
	
	          document.cookie = cookie.join('; ');
	        },
	
	        read: function read(name) {
	          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
	          return (match ? decodeURIComponent(match[3]) : null);
	        },
	
	        remove: function remove(name) {
	          this.write(name, '', Date.now() - 86400000);
	        }
	      };
	    })() :
	
	  // Non standard browser env (web workers, react-native) lack needed support.
	    (function nonStandardBrowserEnv() {
	      return {
	        write: function write() {},
	        read: function read() { return null; },
	        remove: function remove() {}
	      };
	    })()
	);


/***/ }),

/***/ 398:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var isAbsoluteURL = __webpack_require__(399);
	var combineURLs = __webpack_require__(400);
	
	/**
	 * Creates a new URL by combining the baseURL with the requestedURL,
	 * only when the requestedURL is not already an absolute URL.
	 * If the requestURL is absolute, this function returns the requestedURL untouched.
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} requestedURL Absolute or relative URL to combine
	 * @returns {string} The combined full path
	 */
	module.exports = function buildFullPath(baseURL, requestedURL) {
	  if (baseURL && !isAbsoluteURL(requestedURL)) {
	    return combineURLs(baseURL, requestedURL);
	  }
	  return requestedURL;
	};


/***/ }),

/***/ 399:
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	module.exports = function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
	};


/***/ }),

/***/ 400:
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 * @returns {string} The combined URL
	 */
	module.exports = function combineURLs(baseURL, relativeURL) {
	  return relativeURL
	    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
	    : baseURL;
	};


/***/ }),

/***/ 401:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	
	// Headers whose duplicates are ignored by node
	// c.f. https://nodejs.org/api/http.html#http_message_headers
	var ignoreDuplicateOf = [
	  'age', 'authorization', 'content-length', 'content-type', 'etag',
	  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
	  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
	  'referer', 'retry-after', 'user-agent'
	];
	
	/**
	 * Parse headers into an object
	 *
	 * ```
	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
	 * Content-Type: application/json
	 * Connection: keep-alive
	 * Transfer-Encoding: chunked
	 * ```
	 *
	 * @param {String} headers Headers needing to be parsed
	 * @returns {Object} Headers parsed into an object
	 */
	module.exports = function parseHeaders(headers) {
	  var parsed = {};
	  var key;
	  var val;
	  var i;
	
	  if (!headers) { return parsed; }
	
	  utils.forEach(headers.split('\n'), function parser(line) {
	    i = line.indexOf(':');
	    key = utils.trim(line.substr(0, i)).toLowerCase();
	    val = utils.trim(line.substr(i + 1));
	
	    if (key) {
	      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
	        return;
	      }
	      if (key === 'set-cookie') {
	        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
	      } else {
	        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
	      }
	    }
	  });
	
	  return parsed;
	};


/***/ }),

/***/ 402:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	
	module.exports = (
	  utils.isStandardBrowserEnv() ?
	
	  // Standard browser envs have full support of the APIs needed to test
	  // whether the request URL is of the same origin as current location.
	    (function standardBrowserEnv() {
	      var msie = /(msie|trident)/i.test(navigator.userAgent);
	      var urlParsingNode = document.createElement('a');
	      var originURL;
	
	      /**
	    * Parse a URL to discover it's components
	    *
	    * @param {String} url The URL to be parsed
	    * @returns {Object}
	    */
	      function resolveURL(url) {
	        var href = url;
	
	        if (msie) {
	        // IE needs attribute set twice to normalize properties
	          urlParsingNode.setAttribute('href', href);
	          href = urlParsingNode.href;
	        }
	
	        urlParsingNode.setAttribute('href', href);
	
	        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	        return {
	          href: urlParsingNode.href,
	          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
	          host: urlParsingNode.host,
	          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
	          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
	          hostname: urlParsingNode.hostname,
	          port: urlParsingNode.port,
	          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
	            urlParsingNode.pathname :
	            '/' + urlParsingNode.pathname
	        };
	      }
	
	      originURL = resolveURL(window.location.href);
	
	      /**
	    * Determine if a URL shares the same origin as the current location
	    *
	    * @param {String} requestURL The URL to test
	    * @returns {boolean} True if URL shares the same origin, otherwise false
	    */
	      return function isURLSameOrigin(requestURL) {
	        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
	        return (parsed.protocol === originURL.protocol &&
	            parsed.host === originURL.host);
	      };
	    })() :
	
	  // Non standard browser envs (web workers, react-native) lack needed support.
	    (function nonStandardBrowserEnv() {
	      return function isURLSameOrigin() {
	        return true;
	      };
	    })()
	);


/***/ }),

/***/ 403:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var AxiosError = __webpack_require__(388);
	var utils = __webpack_require__(379);
	
	/**
	 * A `CanceledError` is an object that is thrown when an operation is canceled.
	 *
	 * @class
	 * @param {string=} message The message.
	 */
	function CanceledError(message) {
	  // eslint-disable-next-line no-eq-null,eqeqeq
	  AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED);
	  this.name = 'CanceledError';
	}
	
	utils.inherits(CanceledError, AxiosError, {
	  __CANCEL__: true
	});
	
	module.exports = CanceledError;


/***/ }),

/***/ 404:
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function parseProtocol(url) {
	  var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
	  return match && match[1] || '';
	};


/***/ }),

/***/ 405:
/***/ (function(module, exports) {

	// eslint-disable-next-line strict
	module.exports = null;


/***/ }),

/***/ 406:
/***/ (function(module, exports) {

	'use strict';
	
	module.exports = function isCancel(value) {
	  return !!(value && value.__CANCEL__);
	};


/***/ }),

/***/ 407:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	
	/**
	 * Config-specific merge-function which creates a new config-object
	 * by merging two configuration objects together.
	 *
	 * @param {Object} config1
	 * @param {Object} config2
	 * @returns {Object} New object resulting from merging config2 to config1
	 */
	module.exports = function mergeConfig(config1, config2) {
	  // eslint-disable-next-line no-param-reassign
	  config2 = config2 || {};
	  var config = {};
	
	  function getMergedValue(target, source) {
	    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
	      return utils.merge(target, source);
	    } else if (utils.isPlainObject(source)) {
	      return utils.merge({}, source);
	    } else if (utils.isArray(source)) {
	      return source.slice();
	    }
	    return source;
	  }
	
	  // eslint-disable-next-line consistent-return
	  function mergeDeepProperties(prop) {
	    if (!utils.isUndefined(config2[prop])) {
	      return getMergedValue(config1[prop], config2[prop]);
	    } else if (!utils.isUndefined(config1[prop])) {
	      return getMergedValue(undefined, config1[prop]);
	    }
	  }
	
	  // eslint-disable-next-line consistent-return
	  function valueFromConfig2(prop) {
	    if (!utils.isUndefined(config2[prop])) {
	      return getMergedValue(undefined, config2[prop]);
	    }
	  }
	
	  // eslint-disable-next-line consistent-return
	  function defaultToConfig2(prop) {
	    if (!utils.isUndefined(config2[prop])) {
	      return getMergedValue(undefined, config2[prop]);
	    } else if (!utils.isUndefined(config1[prop])) {
	      return getMergedValue(undefined, config1[prop]);
	    }
	  }
	
	  // eslint-disable-next-line consistent-return
	  function mergeDirectKeys(prop) {
	    if (prop in config2) {
	      return getMergedValue(config1[prop], config2[prop]);
	    } else if (prop in config1) {
	      return getMergedValue(undefined, config1[prop]);
	    }
	  }
	
	  var mergeMap = {
	    'url': valueFromConfig2,
	    'method': valueFromConfig2,
	    'data': valueFromConfig2,
	    'baseURL': defaultToConfig2,
	    'transformRequest': defaultToConfig2,
	    'transformResponse': defaultToConfig2,
	    'paramsSerializer': defaultToConfig2,
	    'timeout': defaultToConfig2,
	    'timeoutMessage': defaultToConfig2,
	    'withCredentials': defaultToConfig2,
	    'adapter': defaultToConfig2,
	    'responseType': defaultToConfig2,
	    'xsrfCookieName': defaultToConfig2,
	    'xsrfHeaderName': defaultToConfig2,
	    'onUploadProgress': defaultToConfig2,
	    'onDownloadProgress': defaultToConfig2,
	    'decompress': defaultToConfig2,
	    'maxContentLength': defaultToConfig2,
	    'maxBodyLength': defaultToConfig2,
	    'beforeRedirect': defaultToConfig2,
	    'transport': defaultToConfig2,
	    'httpAgent': defaultToConfig2,
	    'httpsAgent': defaultToConfig2,
	    'cancelToken': defaultToConfig2,
	    'socketPath': defaultToConfig2,
	    'responseEncoding': defaultToConfig2,
	    'validateStatus': mergeDirectKeys
	  };
	
	  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
	    var merge = mergeMap[prop] || mergeDeepProperties;
	    var configValue = merge(prop);
	    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
	  });
	
	  return config;
	};


/***/ }),

/***/ 408:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var VERSION = __webpack_require__(409).version;
	var AxiosError = __webpack_require__(388);
	
	var validators = {};
	
	// eslint-disable-next-line func-names
	['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
	  validators[type] = function validator(thing) {
	    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
	  };
	});
	
	var deprecatedWarnings = {};
	
	/**
	 * Transitional option validator
	 * @param {function|boolean?} validator - set to false if the transitional option has been removed
	 * @param {string?} version - deprecated version / removed since version
	 * @param {string?} message - some message with additional info
	 * @returns {function}
	 */
	validators.transitional = function transitional(validator, version, message) {
	  function formatMessage(opt, desc) {
	    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
	  }
	
	  // eslint-disable-next-line func-names
	  return function(value, opt, opts) {
	    if (validator === false) {
	      throw new AxiosError(
	        formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
	        AxiosError.ERR_DEPRECATED
	      );
	    }
	
	    if (version && !deprecatedWarnings[opt]) {
	      deprecatedWarnings[opt] = true;
	      // eslint-disable-next-line no-console
	      console.warn(
	        formatMessage(
	          opt,
	          ' has been deprecated since v' + version + ' and will be removed in the near future'
	        )
	      );
	    }
	
	    return validator ? validator(value, opt, opts) : true;
	  };
	};
	
	/**
	 * Assert object's properties type
	 * @param {object} options
	 * @param {object} schema
	 * @param {boolean?} allowUnknown
	 */
	
	function assertOptions(options, schema, allowUnknown) {
	  if (typeof options !== 'object') {
	    throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
	  }
	  var keys = Object.keys(options);
	  var i = keys.length;
	  while (i-- > 0) {
	    var opt = keys[i];
	    var validator = schema[opt];
	    if (validator) {
	      var value = options[opt];
	      var result = value === undefined || validator(value, opt, options);
	      if (result !== true) {
	        throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
	      }
	      continue;
	    }
	    if (allowUnknown !== true) {
	      throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
	    }
	  }
	}
	
	module.exports = {
	  assertOptions: assertOptions,
	  validators: validators
	};


/***/ }),

/***/ 409:
/***/ (function(module, exports) {

	module.exports = {
	  "version": "0.27.2"
	};

/***/ }),

/***/ 410:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var CanceledError = __webpack_require__(403);
	
	/**
	 * A `CancelToken` is an object that can be used to request cancellation of an operation.
	 *
	 * @class
	 * @param {Function} executor The executor function.
	 */
	function CancelToken(executor) {
	  if (typeof executor !== 'function') {
	    throw new TypeError('executor must be a function.');
	  }
	
	  var resolvePromise;
	
	  this.promise = new Promise(function promiseExecutor(resolve) {
	    resolvePromise = resolve;
	  });
	
	  var token = this;
	
	  // eslint-disable-next-line func-names
	  this.promise.then(function(cancel) {
	    if (!token._listeners) return;
	
	    var i;
	    var l = token._listeners.length;
	
	    for (i = 0; i < l; i++) {
	      token._listeners[i](cancel);
	    }
	    token._listeners = null;
	  });
	
	  // eslint-disable-next-line func-names
	  this.promise.then = function(onfulfilled) {
	    var _resolve;
	    // eslint-disable-next-line func-names
	    var promise = new Promise(function(resolve) {
	      token.subscribe(resolve);
	      _resolve = resolve;
	    }).then(onfulfilled);
	
	    promise.cancel = function reject() {
	      token.unsubscribe(_resolve);
	    };
	
	    return promise;
	  };
	
	  executor(function cancel(message) {
	    if (token.reason) {
	      // Cancellation has already been requested
	      return;
	    }
	
	    token.reason = new CanceledError(message);
	    resolvePromise(token.reason);
	  });
	}
	
	/**
	 * Throws a `CanceledError` if cancellation has been requested.
	 */
	CancelToken.prototype.throwIfRequested = function throwIfRequested() {
	  if (this.reason) {
	    throw this.reason;
	  }
	};
	
	/**
	 * Subscribe to the cancel signal
	 */
	
	CancelToken.prototype.subscribe = function subscribe(listener) {
	  if (this.reason) {
	    listener(this.reason);
	    return;
	  }
	
	  if (this._listeners) {
	    this._listeners.push(listener);
	  } else {
	    this._listeners = [listener];
	  }
	};
	
	/**
	 * Unsubscribe from the cancel signal
	 */
	
	CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
	  if (!this._listeners) {
	    return;
	  }
	  var index = this._listeners.indexOf(listener);
	  if (index !== -1) {
	    this._listeners.splice(index, 1);
	  }
	};
	
	/**
	 * Returns an object that contains a new `CancelToken` and a function that, when called,
	 * cancels the `CancelToken`.
	 */
	CancelToken.source = function source() {
	  var cancel;
	  var token = new CancelToken(function executor(c) {
	    cancel = c;
	  });
	  return {
	    token: token,
	    cancel: cancel
	  };
	};
	
	module.exports = CancelToken;


/***/ }),

/***/ 411:
/***/ (function(module, exports) {

	'use strict';
	
	/**
	 * Syntactic sugar for invoking a function and expanding an array for arguments.
	 *
	 * Common use case would be to use `Function.prototype.apply`.
	 *
	 *  ```js
	 *  function f(x, y, z) {}
	 *  var args = [1, 2, 3];
	 *  f.apply(null, args);
	 *  ```
	 *
	 * With `spread` this example can be re-written.
	 *
	 *  ```js
	 *  spread(function(x, y, z) {})([1, 2, 3]);
	 *  ```
	 *
	 * @param {Function} callback
	 * @returns {Function}
	 */
	module.exports = function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	};


/***/ }),

/***/ 412:
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var utils = __webpack_require__(379);
	
	/**
	 * Determines whether the payload is an error thrown by Axios
	 *
	 * @param {*} payload The value to test
	 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
	 */
	module.exports = function isAxiosError(payload) {
	  return utils.isObject(payload) && (payload.isAxiosError === true);
	};


/***/ }),

/***/ 413:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (g && (g = 0, op[0] && (_ = 0)), _) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CardsService = exports.cardsService = void 0;
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(377);
	var models_1 = __webpack_require__(5);
	exports.cardsService = {
	    getAllCardsCollection: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        var urlParams;
	        return __generator(this, function (_a) {
	            urlParams = "?boardId=".concat(params.boardId, "&searchText=").concat(params.searchText, "&sortBy=").concat(params.sortBy, "&isPublic=").concat(params.isPublic, "&isFavorite=").concat(params.isFavorite, "&isShared=").concat(params.isShared, "&page=").concat(params.page);
	            return [2 /*return*/, axios_1.default.get("/magneto/cards/collection".concat(urlParams))
	                    .then(function (res) { return new models_1.Cards(res.data); })];
	        });
	    }); },
	    getAllCardsByBoard: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        var pageParams, fromStartPage;
	        return __generator(this, function (_a) {
	            pageParams = params.page !== null && params.page !== undefined ? "?page=".concat(params.page) : '';
	            fromStartPage = params.fromStartPage !== null && params.fromStartPage !== undefined ? "&fromStartPage=".concat(params.fromStartPage) : '';
	            return [2 /*return*/, axios_1.default.get("/magneto/cards/".concat(params.boardId).concat(pageParams).concat(fromStartPage))
	                    .then(function (res) { return new models_1.Cards(res.data); })];
	        });
	    }); },
	    getAllCardsBySection: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        var urlParams;
	        return __generator(this, function (_a) {
	            urlParams = params.page !== null ? "?page=".concat(params.page) : '';
	            return [2 /*return*/, axios_1.default.get("/magneto/cards/section/".concat(params.sectionId).concat(urlParams))
	                    .then(function (res) { return new models_1.Cards(res.data); })];
	        });
	    }); },
	    getCardById: function (id) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.get("/magneto/card/".concat(id))
	                    .then(function (res) { return new models_1.Card().build(res.data); })];
	        });
	    }); },
	    createCard: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.post("/magneto/card", params.toJSON())];
	        });
	    }); },
	    updateCard: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.put("/magneto/card", params.toJSON())];
	        });
	    }); },
	    duplicateCard: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.post("/magneto/card/duplicate", { cardIds: params.cardIds, boardId: params.boardId })];
	        });
	    }); },
	    deleteCard: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.delete("/magneto/cards/".concat(params.boardId), { data: { cardIds: params.cardIds } })];
	        });
	    }); },
	    moveCard: function (params, boardId) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.post("/magneto/card/move", { card: params.toJSON(), boardId: boardId })];
	        });
	    }); },
	    favoriteCard: function (cardId, isFavorite) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.put("/magneto/card/".concat(cardId, "/favorite"), { isFavorite: isFavorite })
	                    .then(function (res) { return res.status == 200; })];
	        });
	    }); }
	};
	exports.CardsService = entcore_1.ng.service('CardsService', function () { return exports.cardsService; });


/***/ }),

/***/ 414:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (g && (g = 0, op[0] && (_ = 0)), _) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FoldersService = exports.foldersService = void 0;
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(377);
	var models_1 = __webpack_require__(5);
	exports.foldersService = {
	    getFolders: function (isDeleted) { return __awaiter(void 0, void 0, void 0, function () {
	        var urlParams;
	        return __generator(this, function (_a) {
	            urlParams = "?isDeleted=".concat(isDeleted);
	            return [2 /*return*/, axios_1.default.get("/magneto/folders".concat(urlParams))
	                    .then(function (res) { return res.data.map(function (folder) { return new models_1.Folder().build(folder); }); })];
	        });
	    }); },
	    createFolder: function (title, parentId) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.post("/magneto/folder", { title: title, parentId: parentId })];
	        });
	    }); },
	    preDeleteFolders: function (folderIds) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.put("/magneto/folders/predelete", { folderIds: folderIds })];
	        });
	    }); },
	    restorePreDeleteFolders: function (folderIds) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.put("/magneto/folders/restore", { folderIds: folderIds })];
	        });
	    }); },
	    deleteFolders: function (folderIds) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.delete("/magneto/folders", { data: { folderIds: folderIds } })];
	        });
	    }); },
	    updateFolder: function (folderId, title) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.put("/magneto/folder/".concat(folderId), { title: title })];
	        });
	    }); }
	};
	exports.FoldersService = entcore_1.ng.service('FoldersService', function () { return exports.foldersService; });


/***/ }),

/***/ 415:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (g && (g = 0, op[0] && (_ = 0)), _) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SectionsService = exports.sectionsService = void 0;
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(377);
	var section_model_1 = __webpack_require__(9);
	exports.sectionsService = {
	    getSectionsByBoard: function (boardId) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.get("/magneto/sections/".concat(boardId))
	                    .then(function (res) { return new section_model_1.Sections(res.data); })];
	        });
	    }); },
	    create: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.post("/magneto/section", params.toJSON())];
	        });
	    }); },
	    update: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.put("/magneto/section", params.toJSON())];
	        });
	    }); },
	    delete: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.delete("/magneto/sections", { data: params })];
	        });
	    }); },
	    duplicate: function (params) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.post("/magneto/section/duplicate", { sectionIds: params.sectionIds, boardId: params.boardId })];
	        });
	    }); }
	};
	exports.SectionsService = entcore_1.ng.service('SectionsService', function () { return exports.sectionsService; });


/***/ }),

/***/ 416:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (g && (g = 0, op[0] && (_ = 0)), _) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CommentsService = exports.commentsService = void 0;
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(377);
	var card_comment_model_1 = __webpack_require__(12);
	exports.commentsService = {
	    addComment: function (cardId, comment) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.post("/magneto/card/".concat(cardId, "/comment"), { content: comment })
	                    .then(function (res) { return new card_comment_model_1.CardComment().build(res.data); })];
	        });
	    }); },
	    getComments: function (cardId, page) {
	        return axios_1.default.get("/magneto/card/".concat(cardId, "/comments?page=").concat(page))
	            .then(function (res) { return new card_comment_model_1.CardComments(res.data); });
	    },
	    updateComment: function (cardId, commentId, content) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.put("/magneto/card/".concat(cardId, "/comment/").concat(commentId), { content: content })
	                    .then(function (res) { return new card_comment_model_1.CardComment().build(res.data); })];
	        });
	    }); },
	    deleteComment: function (cardId, commentId) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.delete("/magneto/card/".concat(cardId, "/comment/").concat(commentId))];
	        });
	    }); }
	};
	exports.CommentsService = entcore_1.ng.service('CommentsService', function () { return exports.commentsService; });


/***/ }),

/***/ 417:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __generator = (this && this.__generator) || function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (g && (g = 0, op[0] && (_ = 0)), _) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.WorkspaceService = exports.workspaceService = void 0;
	var entcore_1 = __webpack_require__(1);
	var axios_1 = __webpack_require__(377);
	exports.workspaceService = {
	    canEditDocument: function (documentId) { return __awaiter(void 0, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	            return [2 /*return*/, axios_1.default.get("/magneto/workspace/".concat(documentId, "/canedit"))
	                    .then(function (res) {
	                    return res.data['canEdit'];
	                })];
	        });
	    }); }
	};
	exports.WorkspaceService = entcore_1.ng.service('WorkspaceService', function () { return exports.workspaceService; });


/***/ })

/******/ });
//# sourceMappingURL=behaviours.js.map