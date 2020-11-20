var Gun = require('../gun');

Gun.on('opt', function(root){
	var opt = root.opt;
	if(false === opt.ws || opt.once){
		this.to.next(root);
		return;
	}

	var url = require('url');
	opt.mesh = opt.mesh || Gun.Mesh(root);
	opt.WebSocket = opt.WebSocket || require('ws');
	var ws = opt.ws = opt.ws || {};
	ws.path = ws.path || '/gun';
	// if we DO need an HTTP server, then choose ws specific one or GUN default one.
	if(!ws.noServer){
		ws.server = ws.server || opt.web;
		if(!ws.server){ return }
	}
	ws.web = ws.web || new opt.WebSocket.Server(ws); // we still need a WS server.
	ws.web.on('connection', function(wire){ var peer;
		wire.upgradeReq = wire.upgradeReq || {};
		wire.url = url.parse(wire.upgradeReq.url||'', true);
		opt.mesh.hi(peer = {wire: wire});
		wire.on('message', function(msg){
      debugger;
      console.log('wiremessage: ',msg);
			opt.mesh.hear(msg.data || msg, peer);
		});
		wire.on('close', function(){
			opt.mesh.bye(peer);
		});
		wire.on('error', function(e){});
		setTimeout(function heart(){ if(!opt.peers[peer.id]){ return } try{ wire.send("[]") }catch(e){} ;setTimeout(heart, 1000 * 20) }, 1000 * 20); // Some systems, like Heroku, require heartbeats to not time out. // TODO: Make this configurable? // TODO: PERF: Find better approach than try/timeouts?
	});

	this.to.next(root);
});
