iD.modes.Select = function(context, selectedIDs) {
    var mode = {
        id: 'select',
        button: 'browse'
    };

    var keybinding = d3.keybinding('select'),
        timeout = null,
        behaviors = [
            iD.behavior.Hover(context),
            iD.behavior.Select(context)],
        //inspector;
        tooltip,
        //newFeature = false;
        suppressMenu = false;

    var wrap = context.container()
        .select('.inspector-wrap');

    function singular() {
        if (selectedIDs.length === 1) {
            return context.entity(selectedIDs[0]);
        }
    }

    function closeTooltip() {
        if (tooltip) {
            tooltip.remove();
        }
    }

    function showTooltip(entity) {
        closeTooltip();
        var tags = entity.tags;
            preset = context.presets().match(entity, context.graph());
        var center = context.mouse();

        tooltip = d3.select("#content")
            .append('div')
            .attr('class', 'tooltip-inner radial-menu-tooltip')
            .style('left', 25 + center[0] + 'px')
            .style('top', 25 + center[1]+ 'px')
            .style('display', 'block');
        tooltip.append('h3').html(preset.name());

        var $list = tooltip.append('ul');

        var entries = d3.entries(tags);
        var $items = $list.selectAll('li')
            .data(entries, function(d) { return d.key; });

        $item = $items.enter()
            .append('li')
            .attr('class', 'tag-row');
        $item.append('div')
            .attr('class', 'key-wrap')
            .html(function(d) { return d.key; });
        $item.append('div')
            .attr('class', 'input-wrap-position')
            .html(function(d) { return d.value; });

    }

    mode.selectedIDs = function() {
        return selectedIDs;
    };

    mode.reselect = function() {
        var surfaceNode = context.surface().node();
        if (surfaceNode.focus) { // FF doesn't support it
            surfaceNode.focus();
        }

        context.ui().photoEditor.select(singular());
        showTooltip(singular());
    };

    //mode.newFeature = function(_) {
        //if (!arguments.length) return newFeature;
        //newFeature = _;
        //return mode;
    //};

    mode.suppressMenu = function(_) {
        if (!arguments.length) return suppressMenu;
        suppressMenu = _;
        return mode;
    };

    mode.enter = function() {
        behaviors.forEach(function(behavior) {
            context.install(behavior);
        });

        //var operations = _.without(d3.values(iD.operations), iD.operations.Delete)
            //.map(function(o) { return o(selectedIDs, context); })
            //.filter(function(o) { return o.available(); });
        //operations.unshift(iD.operations.Delete(selectedIDs, context));

        //keybinding.on('⎋', function() {
            //context.enter(iD.modes.Browse(context));
        //}, true);

        //operations.forEach(function(operation) {
            //operation.keys.forEach(function(key) {
                //keybinding.on(key, function() {
                    //if (!operation.disabled()) {
                        //operation();
                    //}
                //});
            //});
        //});

        //var notNew = selectedIDs.filter(function(id) {
            //return !context.entity(id).isNew();
        //});

        //if (notNew.length) {
            //var q = iD.util.stringQs(location.hash.substring(1));
            //location.replace('#' + iD.util.qsString(_.assign(q, {
                //id: notNew.join(',')
            //}), true));
        //}

        //context.history()
            //.on('undone.select', update)
            //.on('redone.select', update);

        //function update() {
            ////context.surface().call(radialMenu.close);

            //if (_.any(selectedIDs, function(id) { return !context.hasEntity(id); })) {
                //// Exit mode if selected entity gets undone
                //context.enter(iD.modes.Browse(context));
            //}
        //}

        context.map().on('move.select', function() {
            context.surface().call(closeTooltip);
        });

        //function dblclick() {
            //var target = d3.select(d3.event.target),
                //datum = target.datum();

            //if (datum instanceof iD.Way && !target.classed('fill')) {
                //var choice = iD.geo.chooseEdge(context.childNodes(datum), context.mouse(), context.projection),
                    //node = iD.Node();

                //var prev = datum.nodes[choice.index - 1],
                    //next = datum.nodes[choice.index];

                    //iD.actions.AddMidpoint({loc: choice.loc, edge: [prev, next]}, node),
                //context.perform(
                    //t('operations.add.annotation.vertex'));

                //d3.event.preventDefault();
                //d3.event.stopPropagation();
            //}
        //}

        d3.select(document)
            .call(keybinding);

        function selectElements() {
            context.surface()
                .selectAll(iD.util.entityOrMemberSelector(selectedIDs, context.graph()))
                .classed('selected', true);
        }

        context.map().on('drawn.select', selectElements);
        selectElements();

        var show = d3.event && !suppressMenu;

        if (show) {
            context.ui().sidebar.editor.select(singular());
            showTooltip(singular());
        }

        //timeout = window.setTimeout(function() {
            //if (show) {
                //showMenu();
            //}

            ////context.surface()
                ////.on('dblclick.select', dblclick);
        //}, 200);
    };

    mode.exit = function() {
        if (timeout) window.clearTimeout(timeout);

        //if (inspector) wrap.call(inspector.close);

        behaviors.forEach(function(behavior) {
            context.uninstall(behavior);
        });

        var q = iD.util.stringQs(location.hash.substring(1));
        location.replace('#' + iD.util.qsString(_.omit(q, 'id'), true));

        keybinding.off();

        context.history()
            .on('undone.select', null)
            .on('redone.select', null);

        closeTooltip();
        context.surface()
            //.on('dblclick.select', null)
            .selectAll(".selected")
            .classed('selected', false);

        context.map().on('drawn.select', null);
    };

    return mode;
};
