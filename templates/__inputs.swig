{%- macro input(type, item) %}
    {%-if item.element === 'select' %}
            <div class="form-group">
                <label for="{{item.name}}">{{item.label}}</label>
                <select id="{{identity + '_' + item.name}}"
                    name="{{item.name}}"
                    data-uri="<%= urlFor('PUT', '{{item.name}}'); %>"
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

{%- macro button(type, label, type) %}
        <button type="{{ type|default("submit") }}" class="btn btn-{{type|default("default")}}">{{ label|default("Submit") }}</button>
{%- endmacro %}
