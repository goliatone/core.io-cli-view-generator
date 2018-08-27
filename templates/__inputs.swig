{%- macro input(type, item) %}

    {%-if item.primaryKey %}
        <div class="form-group">
            <label for="{{item.name}}">{{item.label}}</label>
            <input type="{{item.type}}" name="{{item.name}}" {%if item.required%}required{%endif%} {%if item.pattern%}pattern="{{item.pattern}}"{%endif%}
                id="{{identity + '_' + item.name}}"
                placeholder="{{item.label}}"
                <% if(crudAction !== 'create'){ %>
                disabled="disabled"
                <% } %>
                value="<%= record.{{item.name}} ? record.{{item.name}} : '{{item.default}}' %>"
                class="form-control"
                />
        </div>
    {%-elseif item.entityType === 'object' %}
    {#
    This is for a rich text editor for Objects, code mirror or something. 
    #}
    <div class="form-group">
        <label for="{{item.name}}">{{item.label}}</label>
        <textarea name="{{item.name}}" {%if item.required%}required{%endif%} {%if item.pattern%}pattern="{{item.pattern}}"{%endif%}
            id="{{identity + '_' + item.name}}"
            class="form-control js-json-editor"><%= record.{{item.name}} ? JSON.stringify(record.{{item.name}}, null, 4) : '{{item.default}}' %></textarea>
    </div>
    {%-elseif item.element === 'select' %}
            <div class="form-group">
                <label for="{{item.name}}">{{item.label}}</label>
                <select id="{{identity + '_' + item.name}}"
                    name="{{item.name}}"
                    data-reluri="<%= {{itm.uri}} %>"
                    data-crudaction="<%= locals.crudAction %>"
                    data-uri="<%= urlFor(locals.crudAction, '{{item.uri}}'); %>"
                    data-rel="{{item.relType}}"
                    
                    value="<%= record.{{item.name}} ? record.{{item.name}} : '{{item.default}}' %>"

                    {%if item.relType%}
                    class="js-select-autopopulate form-control"
                    {%else%}
                    class="form-control"
                    {%endif%} >
                {%- for option in item.options -%}
                    <option value="{{option}}">{{option|title}}</option>
                {% endfor %}
                </select>
            </div>
    {%-elseif item.element === 'multiselect' %}
            <div class="form-group">
                <label for="{{item.name}}">{{item.label}}</label>
                <select id="{{identity + '_' + item.name}}"
                    name="{{item.name}}"
                    data-reluri="<%= {{itm.uri}} %>"
                    data-crudaction="<%= locals.crudAction %>"
                    data-uri="<%= urlFor(locals.crudAction, '{{item.uri}}'); %>"
                    {%if item.relType%}data-rel="{{item.relType}}"{%endif%}
                    value="<%= record.{{item.name}} ? record.{{item.name}} : '{{item.default}}' %>"
                    class="js-select-autopopulate form-control multiselect"
                    multiple>
                {%- for option in item.options -%}
                    <option value="{{option}}">{{option|title}}</option>
                {% endfor %}
                </select>
            </div>
    {%-elseif item.element === "textarea" %}
            <div class="form-group">
                 <label for="{{item.name}}">{{item.label}}</label>
                <textarea name="{{item.name}}" {%if item.required%}required{%endif%} {%if item.pattern%}pattern="{{item.pattern}}"{%endif%}
                    id="{{identity + '_' + item.name}}"
                    class="form-control"><%= record.{{item.name}} ? record.{{item.name}} : '{{item.default}}' %></textarea>
            </div>
    {%-elseif item.element === "input" %}
            <div class="form-group">
                <label for="{{item.name}}">{{item.label}}</label>
                <input type="{{item.type}}" name="{{item.name}}" {%if item.required%}required{%endif%} {%if item.pattern%}pattern="{{item.pattern}}"{%endif%}
                    id="{{identity + '_' + item.name}}"
                    placeholder="{{item.label}}"
                    value="<%= record.{{item.name}} ? record.{{item.name}} : '{{item.default}}' %>"
                    class="form-control"
                    />
            </div>
    {% else %}
            TDB {{type}}
    {% endif %}

{%- endmacro %}

{%- macro button(type, label, css) %}
        <button
            type="{{ type | default("submit") }}"
            value="{{ label | default("Submit") }}"
            class="btn btn-{{ css | default("default") }}">
                {{ label | default("Submit") }}
        </button>
{%- endmacro %}

{%- macro styles(item) %}
    {%-if item.entityType === 'object' %}
<link rel="stylesheet" href="/js/vendors/codemirror/css/codemirror.css" />
<link rel="stylesheet" href="/js/vendors/codemirror/css/codemirror-fold-gutter.css" />
<link rel="stylesheet" href="/js/vendors/codemirror/css/codemirror-theme.css" />
    {% endif %}
{%- endmacro %}

{%- macro scripts(item) %}
    {%-if item.entityType === 'object' %}
<script src="/js/vendors/codemirror/codemirror.js" type="text/javascript" charset="utf-8"></script>
<script src="/js/vendors/codemirror/active-line.js" type="text/javascript" charset="utf-8"></script>
<script src="/js/vendors/codemirror/javascript.js" type="text/javascript" charset="utf-8"></script>
    {% endif %}
{%- endmacro %}
