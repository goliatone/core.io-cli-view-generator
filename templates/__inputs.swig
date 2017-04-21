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

                    <% if(crudAction === 'create'){ %>
                    data-uri="<%= urlFor('POST', '{{item.name}}'); %>"
                    <% } else { %>
                    data-uri="<%= urlFor('PUT', '{{item.name}}'); %>"
                    <% } %>

                    {%if item.relType%}data-rel="{{item.relType}}"{%endif%}
                    value="<%= record.{{item.name}} ? record.{{item.name}} : '{{item.default}}' %>"
                    class="js-select-autopopulate form-control"
                >
                {%- for option in item.options -%}
                    <option value="{{option}}">{{option|title}}</option>
                {% endfor %}
                </select>
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
