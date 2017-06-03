const FunctionBuilderBase = require('../function-builder-base');
const WebGLFunctionNode = require('./function-node');
const utils = require('../../utils');

module.exports = class WebGLFunctionBuilder extends FunctionBuilderBase {
	addFunction(functionName, jsFunction, paramTypes, returnType) {
		this.addFunctionNode(
			new WebGLFunctionNode(functionName, jsFunction, paramTypes, returnType)
				.setAddFunction(this.addFunction.bind(this))
		);
	}

	///
	/// Function: getStringFromFunctionNames
	///
	/// Parameters:
	/// 	functionList  - {[String,...]} List of function to build the webgl string.
	///
	/// Returns:
	/// 	{String} The full webgl string, of all the various functions. Trace optimized if functionName given
	///
	getStringFromFunctionNames(functionList) {
		const ret = [];
		for (let i = 0; i < functionList.length; ++i) {
			const node = this.nodeMap[functionList[i]];
			if (node) {
				ret.push(this.nodeMap[functionList[i]].getFunctionString());
			}
		}
		return ret.join('\n');
	}

	getPrototypeStringFromFunctionNames(functionList, opt) {
		const ret = [];
		for (let i = 0; i < functionList.length; ++i) {
			const node = this.nodeMap[functionList[i]];
			if (node) {
				ret.push(node.getFunctionPrototypeString(opt));
			}
		}
		return ret.join('\n');
	}

	///
	/// Function: getString
	///
	/// Parameters:
	/// 	functionName  - {String} Function name to trace from. If null, it returns the WHOLE builder stack
	///
	/// Returns:
	/// 	{String} The full webgl string, of all the various functions. Trace optimized if functionName given
	///
	getString(functionName, opt) {
		if (opt === undefined) {
			opt = {};
		}

		if (functionName) {
			return this.getStringFromFunctionNames(this.traceFunctionCalls(functionName, [], opt).reverse(), opt);
		}
		return this.getStringFromFunctionNames(Object.keys(this.nodeMap), opt);
	}

	///
	/// Function: getPrototypeString
	///
	/// Parameters:
	/// 	functionName  - {String} Function name to trace from. If null, it returns the WHOLE builder stack
	///
	/// Returns:
	/// 	{String} The full webgl string, of all the various functions. Trace optimized if functionName given
	///
	getPrototypeString(functionName) {
		this.rootKernel.generate();
		if (functionName) {
			return this.getPrototypeStringFromFunctionNames(this.traceFunctionCalls(functionName, []).reverse());
		}
		return this.getPrototypeStringFromFunctionNames(Object.keys(this.nodeMap));
	}

	addKernel(fnString, paramNames, paramTypes) {
    const kernelNode = new WebGLFunctionNode('kernel', fnString);
    kernelNode.setAddFunction(this.addFunction.bind(this));
    kernelNode.paramNames = paramNames;
    kernelNode.paramTypes = paramTypes;
    kernelNode.isRootKernel = true;
    this.addFunctionNode(kernelNode);
    return kernelNode;
  }

  addSubKernel(fnString, paramTypes) {
    const kernelNode = new WebGLFunctionNode(utils.getFunctionNameFromString(fnString), fnString);
    kernelNode.setAddFunction(this.addFunction.bind(this));
    kernelNode.paramNames = utils.getParamNamesFromString(fnString);
    kernelNode.paramTypes = paramTypes;
    kernelNode.isSubKernel = true;
    this.addFunctionNode(kernelNode);
    return kernelNode;
  }
};